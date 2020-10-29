import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HumanreadablenumberPipe } from './humanreadablenumber.pipe';

import { TooltipModule } from 'ng2-tooltip-directive';


@NgModule({
  declarations: [
    AppComponent,
    HumanreadablenumberPipe
  ],
  imports: [
    BrowserModule,
    TooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
