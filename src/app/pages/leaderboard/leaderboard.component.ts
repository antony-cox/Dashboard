import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import Chart from 'chart.js';
import { LeaderboardService } from 'app/services/leaderboard.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Podium } from 'app/shared/model/podium';

@Component({ templateUrl: 'leaderboard.component.html' })
export class LeaderboardComponent implements OnInit {
    loading = false;
    chartType;
    canvas: any;
    ctx;
    chart;
    data;
    years;
    chartYear;
    colors;
    tableColumns;
    dataSource;
    podium;
    refreshed;
    tableImgPath;

    constructor(private leaderboardService: LeaderboardService, private router: Router) {}

    ngOnInit() {
        this.refreshed = false;
        this.chartType = 'distance';
        this.years = [];
        this.dataSource = [];
        this.podium = new Podium;
        this.tableColumns = ['name', 'distance', 'time', 'speed', 'elevation', 'rides'];
        this.colors = [
            {
                name: "Stijn Struys",
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                borderColor: "rgba(255, 0, 0, 1)"
            },
            {
                name: "Indi Smitz",
                backgroundColor: "rgba(255, 140, 0, 0.1)",
                borderColor: "rgba(255, 140, 0, 1)"
            },
            {
                name: "Wouter Delvaux",
                backgroundColor: "rgba(255, 255, 0, 0.1)",
                borderColor: "rgba(255, 255, 0, 1)"
            },
            {
                name: "Dries Nuyts",
                backgroundColor: "rgba(0, 255, 68, 0.1)",
                borderColor: "rgba(0, 255, 68, 1)"
            },
            {
                name: "Cédric Van Soom",
                backgroundColor: "rgba(0, 255, 255, 0.1)",
                borderColor: "rgba(0, 255, 255, 1)"
            },
            {
                name: "Antony Cox",
                backgroundColor: "rgba(8, 0, 255, 0.1)",
                borderColor: "rgba(8, 0, 255, 1)"
            },
            {
                name: "Philippe Lambrechts",
                backgroundColor: "rgba(255, 0, 166, 0.1)",
                borderColor: "rgba(255, 0, 166, 1)"
            }
        ];
        this.tableImgPath = 'assets/img/podium/yellow/';
        this.loading = true;

        this.leaderboardService.get()
        .pipe(first())
        .subscribe(lb => {
            this.data = lb;
            this.data.forEach(d => {
                this.years.push(d.year);
            });
            this.chartYear = this.years[0];
            this.loadChart();
            this.getTableData();
            this.getPodium();
            this.loading = false;
        });
    }

    onYearChange(value)
    {
        this.chartYear = value;
        this.updateChart();
        this.getTableData();
        this.getPodium();
    }

    onTypeChange(value)
    {
        this.chartType = value;
        this.updateChart();   
        this.getTableData();
        this.setTableImgPath();
    }

    updateChart()
    {
        var chartData = this.getChartData()

        this.chart.data.labels = chartData.labels;
        this.chart.data.datasets[0].data = chartData.data;
        this.chart.data.datasets[0].backgroundColor = chartData.backgroundColors;
        this.chart.data.datasets[0].borderColor = chartData.borderColors;
        this.chart.update();
    }

    loadChart()
    {
        this.canvas = document.getElementById('chart');
        this.ctx = this.canvas.getContext("2d");

        var chartData = this.getChartData();

        this.chart = new Chart(this.ctx, {
            type: 'horizontalBar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    borderColor: chartData.borderColors,
                    backgroundColor: chartData.backgroundColors,
                    borderWidth: 1,
                    data: chartData.data
                }
            ]},
            options: {
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true,
                            fontColor: "#fff"
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontColor: "#fff"
                        }
                    }]
                },
                legend: {
                    display: false
                },
                
            }
        });
    }

    getChartData()
    {
        var chartData = {
            labels: [],
            data: [],
            backgroundColors: [],
            borderColors: []
        };

        var source = [];

        switch(this.chartType)
        {
            case 'distance':
                source = this.data.filter(d => d.year == this.chartYear)[0].distance;
                break;
            case 'time':
                source = this.data.filter(d => d.year == this.chartYear)[0].time;
                break;
            case 'elevation':
                source = this.data.filter(d => d.year == this.chartYear)[0].elevation;
                break;
            case 'rides':
                source = this.data.filter(d => d.year == this.chartYear)[0].rides;
                break;
        }

        for(var i = 0;i < source.length;i++)
        {
            if(source[i].value > 0)
            {
                chartData.labels.push(source[i].name);
                if(this.chartType === 'time') { chartData.data.push(Math.round((source[i].value / 60) * 100) / 100); } else { chartData.data.push(source[i].value); }
                chartData.backgroundColors.push(this.getColor(0, source[i].name));
                chartData.borderColors.push(this.getColor(1, source[i].name));
            }
        }
        
        return chartData;
    }

    getTableData()
    {
        this.dataSource = [];
        let tableData = this.data.filter(d => d.year == this.chartYear)[0];    

        this.dataSource.push({
            name: "Stijn Struys",
            distance: 0,
            time: 0,
            elevation: 0,
            rides: 0,
            speed: 0
        });

        this.dataSource.push({
            name: "Indi Smitz",
            distance: 0,
            time: 0,
            elevation: 0,
            rides: 0,
            speed: 0
        });

        this.dataSource.push({
            name: "Wouter Delvaux",
            distance: 0,
            time: 0,
            elevation: 0,
            rides: 0,
            speed: 0
        });

        this.dataSource.push({
            name: "Dries Nuyts",
            distance: 0,
            time: 0,
            elevation: 0,
            rides: 0,
            speed: 0
        });

        this.dataSource.push({
            name: "Cédric Van Soom",
            distance: 0,
            time: 0,
            elevation: 0,
            rides: 0,
            speed: 0
        });

        this.dataSource.push({
            name: "Antony Cox",
            distance: 0,
            time: 0,
            elevation: 0,
            rides: 0,
            speed: 0
        });

        this.dataSource.push({
            name: "Philippe Lambrechts",
            distance: 0,
            time: 0,
            elevation: 0,
            rides: 0,
            speed: 0
        });

        this.dataSource.forEach(ds => {
            let distance = tableData.distance.filter(td => td.name === ds.name)[0];
            let time = tableData.time.filter(td => td.name === ds.name)[0];
            let elevation = tableData.elevation.filter(td => td.name === ds.name)[0];
            let rides = tableData.rides.filter(td => td.name === ds.name)[0];

            ds.distance = distance.value;
            ds.time = Math.round((time.value / 60) * 100) / 100;
            ds.elevation = elevation.value;
            ds.rides = rides.value;
            if(ds.distance > 0 && ds.time > 0)
            {
                ds.speed = Math.round((ds.distance / ds.time) * 100) / 100;
            }
        });

        switch(this.chartType)
        {
            case 'distance':
                this.dataSource.sort((a,b) => a.distance > b.distance ? -1 : b.distance > a.distance ? 1 : a.name > b.name ? 1 : b.name > a.name ? -1 : 0);
                break;
            case 'time':
                this.dataSource.sort((a,b) => a.time > b.time ? -1 : b.time > a.time ? 1 : a.name > b.name ? 1 : b.name > a.name ? -1 : 0);
                break;
            case 'elevation':
                this.dataSource.sort((a,b) => a.elevation > b.elevation ? -1 : b.elevation > a.elevation ? 1 : a.name > b.name ? 1 : b.name > a.name ? -1 : 0);
                break;
            case 'rides':
                this.dataSource.sort((a,b) => a.rides > b.rides ? -1 : b.rides > a.rides ? 1 : a.name > b.name ? 1 : b.name > a.name ? -1 : 0);
                break;
        }
    }

    getColor(type, name)
    {
        let color = this.colors.filter(c => c.name === name);
        
        if(color.length > 0)
        {
            if(type == 0)
            {
                return color[0].backgroundColor;
            } else if(type == 1)
            {
                return color[0].borderColor;         
            }
        }

        return "";
    }

    getPodium()
    {
        let podiumData = this.data.filter(d => d.year == this.chartYear);    

        if(podiumData.length > 0)
        {
            this.podium.yellow.name = podiumData[0].distance[0].name;
            this.podium.yellow.value = podiumData[0].distance[0].value;

            this.podium.green.name = podiumData[0].time[0].name;
            this.podium.green.value = Math.round((podiumData[0].time[0].value / 60) * 100) / 100;

            this.podium.polka.name = podiumData[0].elevation[0].name;
            this.podium.polka.value = podiumData[0].elevation[0].value;

            this.podium.white.name = podiumData[0].rides[0].name;
            this.podium.white.value = podiumData[0].rides[0].value;
        }
    }

    refresh()
    {
        this.loading = true;
        this.refreshed = true;
        this.leaderboardService.refresh()
        .pipe(first())
        .subscribe(lb => {
            this.data = lb;
            this.years = [];
            this.data.forEach(d => {
                this.years.push(d.year);
            });
            this.chartYear = this.years[0];
            this.updateChart();
            this.getTableData();
            this.getPodium();
            this.loading = false;
        });     
    }

    setTableImgPath()
    {
        switch(this.chartType)
        {
            case 'distance': this.tableImgPath = 'assets/img/podium/yellow/'; break;
            case 'time': this.tableImgPath = 'assets/img/podium/green/'; break;
            case 'elevation': this.tableImgPath = 'assets/img/podium/polka/'; break;
            case 'rides': this.tableImgPath = 'assets/img/podium/white/'; break;
        }    
    }

    showImg(event, show)
    {
        let img = document.getElementById('img-' + event.srcElement.innerText);

        if(show) img.classList.add('shown');
        if(!show) img.classList.remove('shown');
    }
} 