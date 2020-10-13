import { Component, OnInit } from '@angular/core';

import { version } from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'codeclicker';
  public version: string = version;

  linesOfCode = 0;
  addLinesOfCode = 1;
  log = [];
  adjectives = [
    'beautiful',
    'nice',
    'terrific',
    'bad'
  ];

  public writeLineOfCode(): void {
    this.linesOfCode += this.addLinesOfCode;
    let randomAdjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    let sentence = '> You wrote ' + this.addLinesOfCode + ' line' + (this.addLinesOfCode > 1 ? 's' : '') + ' of ' + randomAdjective + ' code.';
    this.log.push(sentence);
    document.querySelector("#log li:last-child").scrollIntoView();
    localStorage.setItem('linesOfCode', this.linesOfCode.toString());
  }

  ngOnInit() {
    this.linesOfCode = parseInt(localStorage.getItem('linesOfCode')) | 0;
    let sentence = '> Loaded ' + this.linesOfCode + ' line' + (this.linesOfCode > 1 ? 's' : '') + ' of code.';
    this.log.push(sentence);
  }
}
