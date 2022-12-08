import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  collapse = false;
  constructor() { }

  ngOnInit(): void {
  }

  toggle(){
    this.collapse = !this.collapse;
  }

}
