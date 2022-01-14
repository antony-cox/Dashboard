import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/services/users.service';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators, FormBuilder, FormArray } from '@angular/forms';
import { User } from 'app/models/user';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Config } from 'app/models/config';
import { ConfigService } from 'app/services/config.service';
import { AuthenticationService } from 'app/services/authentication.service';

@Component({
    selector: 'user-cmp',
    moduleId: module.id,
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit{
    public id: string;
    public user: User;
    public config: Config;
    public superAdmin = false;

    userForm = this.fb.group({
        userId: [{value: '', disabled: true}, Validators.required],
        email: ['', Validators.required],
        ftp: [0],
        weight: [0],
        intervalsId: [''],
        intervalsKey: [''],
        password: [''],
        confirmPassword: [''],
        active: [false],
        permissions: new FormArray([])
    });

    get permissionsFormArray() {
        return this.userForm.controls.permissions as FormArray;
    }

    constructor(private userService: UserService, 
        private configService: ConfigService, 
        private authService: AuthenticationService, 
        private router: Router, 
        private toastr: ToastrService, 
        private fb: FormBuilder) 
    {
        this.config = new Config();
        this.getConfig();
    }
    
    ngOnInit(){
        this.id = this.userService.getId();
        if(this.id) this.userService.setId(null);
        this.getUserDetails();
    } 

    getUserDetails() {
        if(this.id)
        {
            this.userService.getUserById(this.id)
            .pipe(first())
            .subscribe(user => {
                this.user = user;
                this.userForm.patchValue ({
                    userId: user._id,
                    email: user.email,
                    ftp: user.ftp,
                    weight: user.weight,
                    intervalsId: user.intervalsId,
                    intervalsKey: user.intervalsKey,
                    active: user.active
                });

                this.user.permissions.forEach((perm) => {
                    this.permissionsFormArray.controls[this.config.permissions.indexOf(perm)].patchValue(true);
                    if(perm === 'SUPERADMIN') this.superAdmin = true;
                });
            });
        } else {
            this.user = this.authService.currentUserValue;
            this.userForm.patchValue ({
                userId: this.user._id,
                email: this.user.email,
                ftp: this.user.ftp,
                weight: this.user.weight,
                intervalsId: this.user.intervalsId,
                intervalsKey: this.user.intervalsKey,
                active: true
            });
        }
    }

    getConfig() {
        this.configService.get()
            .pipe(first())
            .subscribe(config => {
                this.config.permissions = config;
                this.config.permissions.forEach(() => this.permissionsFormArray.push(new FormControl(false)));
            });
    }

    onSubmit() {
        if(this.userForm.valid)
        {
            if(this.superAdmin)
            {
                this.user.email = this.userForm.get('email').value;
                this.user.ftp = this.userForm.get('ftp').value;
                this.user.weight = this.userForm.get('weight').value;
                this.user.intervalsId = this.userForm.get('intervalsId').value;
                this.user.intervalsKey = this.userForm.get('intervalsKey').value;
                this.user.password = this.userForm.get('password').value;
                this.user.active = this.userForm.get('active').value;
                this.user.permissions = [];
                
                this.config.permissions.forEach((perm) => {
                    if(this.permissionsFormArray.controls[this.config.permissions.indexOf(perm)].value)
                    {
                        this.user.permissions.push(perm);
                    }       
                });
            } else {
                this.user.email = this.userForm.get('email').value;
                this.user.ftp = this.userForm.get('ftp').value;
                this.user.weight = this.userForm.get('weight').value;
                this.user.intervalsId = this.userForm.get('intervalsId').value;
                this.user.intervalsKey = this.userForm.get('intervalsKey').value;
                this.user.password = this.userForm.get('password').value;
                this.user.active = this.userForm.get('active').value;
            }

            this.userService.saveUser(this.user)
            .pipe(first())
            .subscribe(result => {
                this.showNotification('success', 'User saved successfully.');
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
