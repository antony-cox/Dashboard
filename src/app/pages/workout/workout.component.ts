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
import Annotation from 'chartjs-plugin-annotation';

@Component({
    selector: 'workout-cmp',
    moduleId: module.id,
    templateUrl: 'workout.component.html'
})

export class WorkoutComponent implements OnInit{
    public user : User;
    public workouts: Workout[];
    public categories;
    public page = 1;
    public chartsCreated = false;
    public charts;

    workoutSearchForm = this.formBuilder.group({
      name: [''],
      categories: new FormArray([])
    });  

    get workoutCategoriesFormArray() {
      return this.workoutSearchForm.controls.categories as FormArray;
  }

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

      if(this.user.permissions.includes('WORKOUT'))
      {
        this.workoutService.get(this.page, name, category)
        .pipe(first())
        .subscribe(workouts => {
          this.setWorkouts(workouts);
        });
      }
    }

    setWorkouts(workouts)
    {
      let workout;
      this.workouts = [];

      workouts.forEach(w => {
        workout = w;
        workout.goals = workout.description.split('\n\nGoals\n\n')[1];
        workout.goals = workout.goals.replace('\n\n', '');

        workout.description = workout.description.split('\n\nGoals\n\n')[0];
        workout.description = workout.description.replace('How To\n\n', '');
        workout.description = workout.description.replace('Description\n\n', '');
        workout.description = workout.description.replace('\n\n', '');

        this.workouts.push(w);
      });

      this.chartsCreated = false;
      this.getCharts();
    }

    getCharts()
    {
      if(!this.chartsCreated) 
      {
        this.workouts.forEach(w => {
          let canvas = <any> document.getElementById('chart_' + w.name);
          if(this.charts.has(w.name))
          {
            this.charts.get(w.name).destroy();
            this.charts.delete(w.name);
          }
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
        });
      }
    }

    onSubmit()
    {
      this.page = 1
      this.getWorkouts()
    }

    movePage(x)
    {
      if(!(this.page == 1 && x == -1))
      {
        this.page += x;
        this.getWorkouts()
        window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
         });
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

