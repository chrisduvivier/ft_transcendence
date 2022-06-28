import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-select-users',
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.scss']
})
export class SelectUsersComponent implements OnInit {

  /* Get values from the parent component: create-room -> here */
  @Input() users: UserI[] = null;
  
  /* If add user from form using this module, we return outputs to the Parent Component 
  ** ex: here -> create-room
  */
  @Output() addUser: EventEmitter<UserI> = new EventEmitter<UserI>();
  @Output() removeUser: EventEmitter<UserI> = new EventEmitter<UserI>();
  
  searchUsername = new FormControl('');
  filteredUsers: UserI[] = [];
  selectedUser: UserI = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.searchUsername.valueChanges.pipe( // gets triggerd everytime value changes
      debounceTime(500), // set 500ms before change is accepted
      distinctUntilChanged(),
      switchMap( (username: string) => this.userService.findByUsername(username).pipe(
        tap( (users: UserI[]) => this.filteredUsers = users)
      ))
    ).subscribe();
  }

  displayFn(user: UserI) {
    if (user) {
      return user.username;
    } else {
      return '';
    }
  }

  setSelectedUser(user: UserI) {
    this.selectedUser = user;
  }

  /* emit event to Parent (create-room), passing the UserI */
  addUserToForm() {
    this.addUser.emit(this.selectedUser);
    
    /* Reset the form and data after submission to Parent*/
    this.filteredUsers = []
    this.selectedUser = null;
    this.searchUsername.setValue(null);
  }

  removeUserFromForm(user: UserI){
    this.removeUser.emit(user);
  }
}
