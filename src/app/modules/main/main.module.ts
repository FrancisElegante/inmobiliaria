import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { MainComponent } from './pages/main/main.component';
import { ProductoseleccionadoComponent } from './pages/productoseleccionado/productoseleccionado.component';
import { MainRoutingModule } from './main-routing.module';
import { CarruselComponent } from './pages/carrusel/carrusel.component';

import { FormsModule,ReactiveFormsModule, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { MessagesModule } from 'primeng/messages';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { CardsComponent } from './pages/cards/cards.component';

@NgModule({
  declarations: [
    CarritoComponent,
    MainComponent,
    ProductoseleccionadoComponent,
    CarruselComponent,
    CardsComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MessagesModule,
    ButtonModule,
    ToastModule,
    PasswordModule
  ],
  exports: [
    CarruselComponent,
    MainComponent,
    CarritoComponent,
    ProductoseleccionadoComponent
  ],
  providers:[
    MessageService
  ],
})
export class MainModule { }
