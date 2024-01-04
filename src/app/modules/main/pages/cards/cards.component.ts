import { Component } from '@angular/core';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { Productos } from "../../../../models/productos.interface";
import { debounceTime, Observable } from 'rxjs';
import { AfterViewInit, ElementRef, OnInit, inject, ViewChild  } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit{

  _productosService = inject(ProductosService);
  productos$!: Observable<Productos[]>;

  ngOnInit(): void {
    this.productos$ = this._productosService.getPlayers();
    this.productos$ = this._productosService.getPlayers();
    }
}
