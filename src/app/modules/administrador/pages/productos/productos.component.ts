import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, Observable } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Importa el operador switchMap
import { switchMap } from 'rxjs/operators';

import { ProductosService } from 'src/app/shared/services/productos.service';
import { Productos } from 'src/app/models/productos.interface';

import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
  providers: [MessageService]
})
export class ProductosComponent implements OnInit {
  // Observable que contendrá la lista de productos
  productos$!: Observable<Productos[]>;

  // Inyecta el servicio de productos
  _productosService = inject(ProductosService);

  // Inyecta el enrutador
  _router = inject(Router);

  // Control para la barra de búsqueda
  searcher = new FormControl('');

  constructor(private messageService: MessageService) {
    // Constructor
  }

  // Muestra un mensaje de éxito
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Producto editado!', detail: 'Producto editado correctamente' });
  }

  // Muestra un mensaje de error
  showError(errorMsg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error al editar el producto!', detail: errorMsg });
  }

  ngOnInit(): void {
    // Inicialización al cargar el componente

    // Obtén todos los productos al principio
    this.productos$ = this._productosService.getPlayers(); // Sin filtro inicial

    // Suscríbete a los cambios en el valor de la barra de búsqueda con un debounce de 500 ms
    this.searcher.valueChanges.pipe(debounceTime(500)).subscribe((search) => {
      // Obtén los productos con el término de búsqueda actual
      this.productos$ = this._productosService.getPlayers(search || '');
    });
  }

  // Navega a la página de edición de productos
  editPlayer(productos: Productos) {
    this._router.navigateByUrl('/administrador/productos-edit', { state: { productos } });
    console.log(productos);
    console.log(this.productos$);
  }

  // Elimina un producto
  deletePlayer(productos: Productos) {
    // Muestra una confirmación antes de borrar
    if (confirm(`Seguro de borrar a ${productos.nombre}`)) {
      // Verifica que el ID esté definido antes de intentar borrar
      if (productos.id) {
        this._productosService.deletePlayer(productos.id);
      }
    }
  }
}
