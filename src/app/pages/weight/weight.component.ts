import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { User } from 'app/models/user';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/services/authentication.service';
import { Weight } from 'app/models/weight';
import { WeightService } from 'app/services/weight.service';
import Chart from 'chart.js';
import { formatDate } from '@angular/common';

@Component({
    selector: 'weight-cmp',
    moduleId: module.id,
    templateUrl: 'weight.component.html'
})

export class WeightComponent implements OnInit{
    public canvas : any;
    public ctx;
    public chartWeight;
    public chartColor;

    public user : User;
    public weights : Weight[] = [];
    public weightForm: FormGroup;
    public weight: FormControl;

    constructor(
        private authService: AuthenticationService,
        private weightService: WeightService,
        private formBuilder: FormBuilder,
        private toastr: ToastrService
    ) {
        this.user = authService.currentUserValue;
        this.getWeight();

        this.weight = new FormControl(0, [Validators.required, Validators.min(50)]);
    }

    ngOnInit() {
      this.weightForm = this.formBuilder.group({
        weight: [0, [Validators.required, Validators.min(50)]]
      });

    }

    addWeight() {
      if(this.weight.valid)
      {
        this.weightService.add(this.weight.value)
        .pipe(first())
        .subscribe(
            data => {
                this.showNotification('success', 'Weight added successfully!');
                this.getWeight();
            },
            error => {
                console.log(error);
            });
      } else {
        this.showNotification('danger', 'Please provide a valid weight value.');     
      }
    }

    getWeight() {
      if(this.user.permissions.includes('WEIGHT'))
      {
        this.weightService.get()
        .pipe(first())
        .subscribe(weights => {
          this.weights = weights;
          if(this.weights.length > 0)
          {
            this.weight.setValue(this.weights[this.weights.length-1].weight);
            this.weightChart();
          }
        });
      }
    }

    weightChart()
    {
      this.chartColor = "#FFFFFF";

      this.canvas = document.getElementById("chartWeight");
      this.ctx = this.canvas.getContext("2d");

      var weightLabels = [];
      var weightData = [];

      for(var i = this.weights.length;i--;i==0)
      {
        weightData.push(this.weights[i].weight);
        weightLabels.push(formatDate(this.weights[i].date, 'dd/MM/yyyy', 'en-US'));
      }

      this.chartWeight = new Chart(this.ctx, {
        type: 'line',

        data: {
          labels: weightLabels.reverse(),
          datasets: [{
              label: 'Weight',
              borderColor: "#6bd098",
              backgroundColor: "#34b5b8",
              pointRadius: 5,
              pointHoverRadius: 5,
              pointBackgroundColor: "#6bd098",
              pointBorderColor: "#6bd098",
              borderWidth: 3,
              data: weightData.reverse(),
              lineTension: 0.4
            }
          ]
        },
        options: {
          legend: {
            display: false
          },

          tooltips: {
            enabled: true
          },

          scales: {
            yAxes: [{
              ticks: {
                fontColor: "#9f9f9f",
                beginAtZero: false,
                maxTicksLimit: 5,
                //padding: 20
              },
              gridLines: {
                drawBorder: true,
                color: 'rgba(0,0,0,0.1)',
                zeroLineColor: "rgba(0,0,0,0.4)",
                display: true
              }
            }],

            xAxes: [{
              barPercentage: 1.6,
              gridLines: {
                drawBorder: true,
                color: 'rgba(0,0,0,0.1)',
                zeroLineColor: "rgba(0,0,0,0.4)",
                display: true
              },
              ticks: {
                padding: 20,
                fontColor: "#9f9f9f"
              }
            }]
          },
        }
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
