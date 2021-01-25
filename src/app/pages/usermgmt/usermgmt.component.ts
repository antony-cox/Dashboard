import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'app/models/user';
import { AuthenticationService } from 'app/services/authentication.service';
import { UserService } from 'app/services/users.service';
import { first } from 'rxjs/operators';

@Component({
    selector: 'usermgmt',
    moduleId: module.id,
    templateUrl: 'usermgmt.component.html'
})

export class UsermgmtComponent implements OnInit{
    public user: User;
    public users: User[];
    public columnsToDisplay: string[] = ['edit', 'id', 'email'];

    constructor(private userService: UserService, authService: AuthenticationService, private router: Router) {
        this.user = authService.currentUserValue;
        userService.get()
        .pipe(first())
        .subscribe(users => {
            this.users = users;
        });
      }

    ngOnInit(){
    }

    editUser(id)
    {
        this.userService.setId(id);
        this.router.navigate(['/user']);
    }
}
