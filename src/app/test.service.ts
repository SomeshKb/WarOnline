import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  public hexInfo = new Subject();
  public scene = new Subject();
  constructor() { }

}
