import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { User } from 'app/models/user';
import { first, throwIfEmpty } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/services/authentication.service';
import { Workout } from 'app/models/workout';
import { WorkoutService } from 'app/services/workout.service';
import { Chart, ScatterController, LinearScale, LineElement, PointElement, Filler, Tooltip } from 'chart.js';
import annotationPlugin  from 'chartjs-plugin-annotation';
import { CrosshairPlugin } from 'chartjs-plugin-crosshair'
import { FtpService } from "app/services/ftp.service";
import { Subscription } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';


@Component({
    selector: 'workoutDetail-cmp',
    moduleId: module.id,
    templateUrl: 'workoutDetail.component.html'
})

export class WorkoutDetailComponent implements OnInit{
    public user : User;
    public workout: Workout;
    public id;

    public canvas : any;
    public ctx;
    public chart;
    public chartColor;
    public ftp;

    subscription: Subscription;
    panelState = false;

    dateForm = new FormGroup({
      intervalsDate: new FormControl()
    });

    constructor(
        private authService: AuthenticationService,
        private workoutService: WorkoutService,
        private toastr: ToastrService,
        private activatedRoute: ActivatedRoute,
        private ftpService: FtpService,
        private clipboard: Clipboard
    ) {
        Chart.register(ScatterController, LinearScale, LineElement, PointElement, Filler, annotationPlugin, Tooltip, CrosshairPlugin);
        this.user = authService.currentUserValue;
        this.id = this.activatedRoute.snapshot.paramMap.get("id");
        this.getWorkout();
    }

    ngOnInit() {
      this.dateForm.controls['intervalsDate'].patchValue(new Date());
      this.workout = new Workout();
      this.subscription = this.ftpService.currentFtp.subscribe(ftp => {
        this.ftp = ftp;
        globalThis.ftp = this.ftp;
        if(this.workout.data != undefined) { this.updateChart(); }
      });
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();    
    }

    getWorkout()
    {
      if(this.user.permissions.includes('WORKOUT'))
      {
        this.workoutService.getDetail(this.id)
        .pipe(first())
        .subscribe(workout => {
          this.setWorkout(workout);
          this.workoutChart();
        });
      }
    }

    setWorkout(workout)
    {
      this.workout = workout;
      this.workout.goals = this.workout.description.split('\n\nGoals\n\n')[1];
      this.workout.description = this.workout.description.split('\n\nGoals\n\n')[0];
      this.workout.description = this.workout.description.replace('How To\n\n', '');
      this.workout.description = this.workout.description.replace('Description\n\n', '');
    }

    updateChart()
    {
      let chartData = [];

      this.workout.data.forEach(d => {
        chartData.push({x: d.startTime/60, y: (d.startPower/100) * this.ftp });
        chartData.push({x: d.endTime/60, y: (d.endPower/100) * this.ftp });
      })

      this.chart.data.datasets[0].data = chartData;
      this.chart.options.scales.y.suggestedMax = 1.2 * this.ftp;
      this.chart.options.plugins.annotation.annotations.line1.yMin = this.ftp;
      this.chart.options.plugins.annotation.annotations.line1.yMax = this.ftp;
      this.chart.update();
    }

    workoutChart()
    {
      this.canvas = document.getElementById("chartWorkout");
      this.ctx = this.canvas.getContext("2d");

      let chartData = [];
      let backgroundGradient =  this.ctx.createLinearGradient(0, 0, 0, 600);
      backgroundGradient.addColorStop(0, 'rgba(81,203,206,1)');   
      backgroundGradient.addColorStop(1, 'rgba(9,9,121,1)');

      this.workout.data.forEach(d => {
        chartData.push({x: d.startTime/60, y: (d.startPower/100) * this.ftp });
        chartData.push({x: d.endTime/60, y: (d.endPower/100) * this.ftp });
      })

      this.chart = new Chart(this.ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: this.workout.name,
            data: chartData,
            borderColor: 'rgba(9,9,121,1)',
            borderWidth: 2,
            backgroundColor: backgroundGradient,
            pointRadius: 0,
            showLine: true,
            fill: 'origin'
          }]
        },
        options: {
          scales: {
            x: {
              type: "linear",
              max: chartData[chartData.length - 1].x
            },
            y: {
              min: 0,
              suggestedMax: 1.2 * this.ftp
            }
          },
          plugins: {
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  yMin: this.ftp,
                  yMax: this.ftp,
                  borderColor: 'rgb(255, 99, 132)',
                  borderWidth: 2,
                }
              }
            },
            tooltip: {
              mode: 'interpolate',
              intersect: false,
              enabled: false,
              external: function(context) {
                // Tooltip Element
                var tooltipEl = document.getElementById('chartjs-tooltip');

                // Create element on first render
                if (!tooltipEl) {
                  tooltipEl = document.createElement('div');
                  tooltipEl.id = 'chartjs-tooltip';
                  const table = document.createElement('table');
                  table.style.margin = '0px';

                  tooltipEl.appendChild(table);
                  document.body.appendChild(tooltipEl);
                }
                
                // Hide if no tooltip
                var tooltipModel = context.tooltip;
                var time = minTommss(tooltipModel.dataPoints[0].element.x);
                var power = tooltipModel.dataPoints[0].element.y;

                function minTommss(minutes) {
                  var min = Math.floor(Math.abs(minutes));
                  var sec = Math.floor((Math.abs(minutes) * 60) % 60);
                  return (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
                }

                if (tooltipModel.opacity === 0) {
                    tooltipEl.style.opacity = '0';
                    return;
                }

                const tableBody = document.createElement('tbody');
                tableBody.appendChild(getRow(power, 'p'));
                tableBody.appendChild(getRow(time, 't'));

                function getRow(value, type)
                {
                  const span = document.createElement('span');
                  span.style.borderWidth = '2px';
                  span.style.marginRight = '10px';
                  span.style.height = '10px';
                  span.style.width = '10px';
                  span.style.display = 'inline-block';

                  const tr = document.createElement('tr');
                  tr.style.backgroundColor = 'inherit';
                  tr.style.borderWidth = '0';

                  const td = document.createElement('td');
                  td.style.borderWidth = '0';

                  const content = type === 'p' ? 'Power: ' + Math.round(value) + 'W (' + Math.round((value / globalThis.ftp) * 100) + '%)' : 'Time: ' + value + ' min';
                  const powerText = document.createTextNode(content);

                  td.appendChild(span);
                  td.appendChild(powerText);
                  tr.appendChild(td);

                  return tr;
                }

                const tableRoot = tooltipEl.querySelector('table');

                // Remove old children
                while (tableRoot.firstChild) {
                  tableRoot.firstChild.remove();
                }

                // Add new children
                tableRoot.appendChild(tableBody);

                var position = context.chart.canvas.getBoundingClientRect();

                // Display, position, and set styles for font
                tooltipEl.style.opacity = '1';
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                tooltipEl.style.pointerEvents = 'none';
                tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
                tooltipEl.style.borderRadius = '3px';
                tooltipEl.style.color = 'white';
                tooltipEl.style.transition = 'all .1s ease';
                tooltipEl.style.width = '160px';
                tooltipEl.style.height = '50px';
                tooltipEl.style.paddingTop = '5px';
              }
            }
          }
        }
      });

      this.chart.data.datasets[0].interpolate = true;
    }

    copyIntervalsData()
    {
      let intervalsData = '';

      this.workout.data.forEach(d => {
        if(intervalsData != '') { intervalsData += '\n' }
        intervalsData += '- ' + (d.endTime - d.startTime) + 's ' + (d.startPower == d.endPower ? d.startPower + '%' : 'ramp ' + d.startPower + '-' + d.endPower + '%');
      });

      this.clipboard.copy(intervalsData);
      this.showNotification('success', 'Intervals data copied to clipboard.');
    }

    sendToIntervals()
    {
      const intervalDate = new Date(this.dateForm.controls['intervalsDate'].value);
      const month = intervalDate.getMonth() < 9 ? '0' + (intervalDate.getMonth() + 1) : (intervalDate.getMonth() + 1)
      const day = intervalDate.getDate() < 9 ? '0' + intervalDate.getDate() : intervalDate.getDate()

      if(intervalDate != null && intervalDate != undefined)
      {
        if(this.user.intervalsId != '' && this.user.intervalsKey != '')
        {
          const param = {
            workoutId: this.workout._id,
            intervalsId: this.user.intervalsId,
            intervalsKey: this.user.intervalsKey,
            intervalsDate: intervalDate.getFullYear() + '-' + month + '-' + day
          }
  
          this.workoutService.sendToIntervals(param).subscribe(result => {
            if(result.id != null && result.id != undefined)
            {
              this.showNotification('succes', 'Workout sent successfully.');
            } else {
              this.showNotification('danger', 'Macheert nie.');       
            }
          });
        } else {
          this.showNotification('danger', 'Intervals.icu configuration missing, please add in Profile.');   
        }
      } else {
        this.showNotification('danger', 'Please select a valid date.');
      }
    }

    showNotification(style, message)
    {
      this.toastr.info(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + message + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-" + style + " alert-with-icon",
            positionClass: "toast-top-right"
          }
        );   
    }
}

