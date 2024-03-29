import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { User } from 'app/models/user';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/services/authentication.service';
import { Workout } from 'app/models/workout';
import { WorkoutService } from 'app/services/workout.service';
import { Chart, ScatterController, LinearScale, LineElement, PointElement, Filler } from 'chart.js';
import annotationPlugin  from 'chartjs-plugin-annotation';
import { Options } from '@angular-slider/ngx-slider';
import { exit } from 'process';

@Component({
    selector: 'workout-cmp',
    moduleId: module.id,
    templateUrl: 'workout.component.html'
})

export class WorkoutComponent implements OnInit{
    public user : User;
    public workouts: Workout[];
    public categories;
    public page = 0;
    public totalItems = 0;
    public chartsCreated = false;
    public charts;
    public tssLow: number = 0;
    public tssHigh: number = 300;
    public durationLow: number = 0;
    public durationHigh: number = 300;

    workoutSearchForm = this.formBuilder.group({
      name: [''],
      categories: new FormArray([])
    });  

    get workoutCategoriesFormArray() {
      return this.workoutSearchForm.controls.categories as FormArray;
    }

    tssSliderMinValue: number = 0;
    tssSliderMaxValue: number = 300;
    tssSliderOptions: Options = {
      floor: 0,
      ceil: 300
    };

    durationSliderMinValue: number = 0;
    durationSliderMaxValue: number = 360;
    durationSliderOptions: Options = {
      floor: 0,
      ceil: 360
    };

    constructor(
        private authService: AuthenticationService,
        private formBuilder: FormBuilder,
        private workoutService: WorkoutService,
        private toastr: ToastrService
    ) {
        Chart.register(ScatterController, LinearScale, LineElement, PointElement, Filler, annotationPlugin);
        this.user = authService.currentUserValue;
        this.categories = ['', 'Endurance', 'Tempo', 'Sweet Spot', 'Threshold', 'VO2 Max', 'Anaerobic', 'Sprint'];
        this.categories.forEach(() => this.workoutCategoriesFormArray.push(new FormControl(false)));
        this.getWorkouts();
    }

    ngOnInit() {
      this.workouts = [];
      this.charts = new Map<string, any>();
    }

    ngAfterViewChecked()
    {
      this.getCharts();
    }

    getWorkouts()
    {
      let name = this.workoutSearchForm.controls.name.value;
      let category = '';

      this.categories.forEach(c => {
        if(this.workoutCategoriesFormArray.controls[this.categories.indexOf(c)].value)
        {
          category = c;
        } 
      });

      if(this.charts != undefined && this.charts.length > 0)
      {
        this.charts.forEach((value, key) => {
          value.destroy();
          this.charts.delete(key);
        });
      }

      if(this.user.permissions.includes('WORKOUT'))
      {
        const param = {
          page: this.page, limit: 20, name: name, category: category, tssLow: this.tssLow, tssHigh: this.tssHigh, durationLow: this.durationLow, durationHigh: this.durationHigh
        }

        this.workoutService.get(param)
        .pipe(first())
        .subscribe(result => {
          this.totalItems = result.count;
          this.setWorkouts(result.workouts);
        });
      }
    }

    setWorkouts(workouts)
    {
      let workout;
      this.workouts = [];

      workouts.forEach(w => {
        workout = w;

        if(workout.description != null && workout.description != undefined)
        {
          workout.goals = workout.description.split('\n\nGoals\n\n')[1];
          workout.goals = workout.goals != undefined ? workout.goals.replace('\n\n', '') : '';
          workout.description = workout.description.split('\n\nGoals\n\n')[0];
          workout.description = workout.description.replace('How To\n\n', '');
          workout.description = workout.description.replace('Description\n\n', '');
          workout.description = workout.description.replace('\n\n', '');
        }
        
        this.workouts.push(w);
      });

      this.chartsCreated = false;
      this.getCharts();
    }

    getCharts()
    {
      if(!this.chartsCreated) 
      {

        for(let w of this.workouts)
        {
          let canvas = <any> document.getElementById('chart_' + w.name);

          if(canvas != null)
          {
            this.chartsCreated = true;
            let ctx = canvas.getContext("2d");
            let chartData = [];
            let backgroundGradient =  ctx.createLinearGradient(0, 0, 0, 600);
            backgroundGradient.addColorStop(0, 'rgba(81,203,206,1)');   
            backgroundGradient.addColorStop(1, 'rgba(9,9,121,1)');

            w.data.forEach(d => {
              chartData.push({x: d.startTime/60, y: (d.startPower/100) * this.user.ftp });
              chartData.push({x: d.endTime/60, y: (d.endPower/100) * this.user.ftp });
            });

            let chart = new Chart(ctx, {
              type: 'scatter',
              data: {
                datasets: [{
                  label: w.name,
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
                  }
                }
              }
            });

            this.charts.set(w.name, chart);        
          }
        }
      }
    }

    updateTssLow(event)
    {
      this.tssLow = event;
    }

    updateTssHigh(event)
    {
      this.tssHigh = event;
    }

    updateDurationLow(event)
    {
      this.durationLow = event;
    }

    updateDurationHigh(event)
    {
      this.durationHigh = event;
    }
    
    onSubmit()
    {
      this.page = 0;
      this.getWorkouts();
    }

    pageEvent(event)
    {
      if(event.pageIndex > event.previousPageIndex) this.page += 1
      if(event.pageIndex < event.previousPageIndex) this.page -= 1
      
      this.getWorkouts();
        window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
        });
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

