import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent {
  collapse = true;
  constructor() {}

  toggle() {
    this.collapse = !this.collapse;
  }
}
