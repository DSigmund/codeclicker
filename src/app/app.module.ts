import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HumanreadablenumberPipe } from './humanreadablenumber.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HumanreadablenumberPipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
