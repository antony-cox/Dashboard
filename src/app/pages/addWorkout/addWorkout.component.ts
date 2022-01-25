import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { User } from 'app/models/user';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/services/authentication.service';
import { Workout } from 'app/models/workout';
import { WorkoutService } from 'app/services/workout.service';
import { Chart, ScatterController, LinearScale, LineElement, PointElement, Filler, Tooltip } from 'chart.js';
import annotationPlugin  from 'chartjs-plugin-annotation';
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'addWorkout-cmp',
    moduleId: module.id,
    templateUrl: 'addWorkout.component.html'
})

export class AddWorkoutComponent implements OnInit{
    public user : User;
    public workout: Workout;
    public id;

    public canvas : any;
    public ctx;
    public chart;
    public chartColor;
    public editIndex = -1;

    addStepForm = this.formBuilder.group({
      startPower: [0, Validators.required],
      endPower: [0],
      duration: ['', Validators.required]
    });  

    constructor(
        private authService: AuthenticationService,
        private workoutService: WorkoutService,
        private toastr: ToastrService,
        private activatedRoute: ActivatedRoute,
        private formBuilder: FormBuilder
    ) {
        Chart.register(ScatterController, LinearScale, LineElement, PointElement, Filler, annotationPlugin, Tooltip, CrosshairPlugin);
        this.user = this.authService.currentUserValue;
        this.id = this.activatedRoute.snapshot.paramMap.get("id");
    }

    ngOnInit() {
      this.workout = new Workout();
      
      if(this.user.ftp == undefined || this.user.ftp == 0) 
      {
        globalThis.ftp = 100;
        this.user.ftp = 100;
      }
    }

    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.workout.data, event.previousIndex, event.currentIndex);
      this.calculateStepTimes();
      this.updateChart();
    }

    getWorkout()
    {
      if(this.user.permissions.includes('WORKOUT'))
      {
        this.workoutService.getDetail(this.id)
        .pipe(first())
        .subscribe(workout => {
          
        });
      }
    }

    addStep()
    {
      if(this.addStepForm.valid)
      {
        const startPower = parseInt(this.addStepForm.get('startPower').value);
        const endPower = parseInt(this.addStepForm.get('endPower').value);
        const durationValue = this.addStepForm.get('duration').value;
        let duration = parseInt(this.addStepForm.get('duration').value);

        if(!/^\d+$/.test(durationValue))
        {
          if(durationValue.indexOf('m') > -1) { 
            duration = duration * 60;
          } else if(durationValue.indexOf('h') > -1) { 
            duration = duration * 3600; 
          }
        }
        
        const step = {
          startPower: startPower,
          endPower: endPower == 0 || isNaN(endPower) ? startPower : endPower,
          startTime: this.workout.data.length == 0 ? 0 : this.workout.data[this.workout.data.length - 1].endTime,
          endTime: this.workout.data.length == 0 ? duration : this.workout.data[this.workout.data.length - 1].endTime + duration
        }

        if(this.editIndex > -1)
        {
          this.workout.data[this.editIndex] = step;
          this.calculateStepTimes();
          this.editIndex = -1;
        } else { 
          this.workout.data.push(step);
        }
        
        this.addStepForm.reset();

        if(this.workout.data.length == 1)
        {
          this.createChart();
        } else {
          this.updateChart();
        }
      } else {
        this.showNotification('error', 'Please enter required information.');
      }
    }

    editStep(index)
    {
      this.editIndex = index;
      this.addStepForm.reset();
      this.addStepForm.get('startPower').setValue(this.workout.data[index].startPower);
      if(this.workout.data[index].startPower != this.workout.data[index].endPower)
      {
        this.addStepForm.get('endPower').setValue(this.workout.data[index].endPower);
      }
      this.addStepForm.get('duration').setValue(this.workout.data[index].endTime - this.workout.data[index].startTime);
    }

    removeStep(index)
    {
      this.workout.data.splice(index, 1);
      this.calculateStepTimes();
      this.updateChart();
    }

    calculateStepTimes()
    {
      for(let i = 0; i < this.workout.data.length;i++)
      {
        const duration = this.workout.data[i].endTime - this.workout.data[i].startTime;

        this.workout.data[i].startTime = i == 0 ? 0 : this.workout.data[i-1].endTime;
        this.workout.data[i].endTime = this.workout.data[i].startTime + duration;
      }
    }

    updateChart()
    {
      let chartData = [];

      this.workout.data.forEach(d => {
        chartData.push({x: d.startTime/60, y: (d.startPower/100) * this.user.ftp });
        chartData.push({x: d.endTime/60, y: (d.endPower/100) * this.user.ftp });
      });

      this.chart.data.datasets[0].data = chartData;
      this.chart.options.scales.y.suggestedMax = 1.2 * this.user.ftp;
      this.chart.options.scales.x.max = chartData[chartData.length - 1].x
      this.chart.options.plugins.annotation.annotations.line1.yMin = this.user.ftp;
      this.chart.options.plugins.annotation.annotations.line1.yMax = this.user.ftp;
      this.chart.update();
    }

    createChart()
    {
      this.canvas = document.getElementById("chartWorkout");
      this.ctx = this.canvas.getContext("2d");

      let chartData = [];
      let backgroundGradient =  this.ctx.createLinearGradient(0, 0, 0, 600);
      backgroundGradient.addColorStop(0, 'rgba(81,203,206,1)');   
      backgroundGradient.addColorStop(1, 'rgba(9,9,121,1)');

      this.workout.data.forEach(d => {
        chartData.push({x: d.startTime/60, y: (d.startPower/100) * this.user.ftp });
        chartData.push({x: d.endTime/60, y: (d.endPower/100) * this.user.ftp });
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
              suggestedMax: 1.2 * this.user.ftp
            }
          },
          plugins: {
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  yMin: this.user.ftp,
                  yMax: this.user.ftp,
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
                tableBody.appendChild(getRow(time, 't'));
                tableBody.appendChild(getRow(power, 'p'));
                if(globalThis.weight > 0) tableBody.appendChild(getRow(power/globalThis.weight, 'pw'));

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

                  let content = '';

                  switch(type)
                  {
                    case 'p': 
                      content = 'Power: ' + Math.round(value) + 'W (' + Math.round((value / globalThis.ftp) * 100) + '%)';
                      break;
                    case 'pw':
                      content = 'Power/Weight: ' + Math.round(value * 100) / 100 + ' W/KG';
                      break;
                    case 't':
                      content = 'Time: ' + value + ' min';
                      break;
                  }

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
                tooltipEl.style.width = '200px';
                tooltipEl.style.height =  tableBody.children.length * 25 + 'px';
                tooltipEl.style.paddingTop = '5px';
              }
            }
          }
        }
      });

      this.chart.data.datasets[0].interpolate = true;
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

