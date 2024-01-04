import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { Productos } from 'src/app/models/productos.interface';

import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-productos-edit',
  templateUrl: './productos-edit.component.html',
  styleUrls: ['./productos-edit.component.css'],
  providers: [MessageService]
})
export class ProductosEditComponent implements OnInit {
  // FormGroup para el formulario de edición
  form: FormGroup;

  // Producto a editar, inicializado como null
  producto: Productos | null = null;

  // Array de mensajes inicializado como vacío
  messages: Message[] = [];

  constructor(
    // Inyecta el FormBuilder para construir formularios reactivos
    private formBuilder: FormBuilder,
    // Inyecta ActivatedRoute para obtener el estado de la ruta actual
    private activatedRoute: ActivatedRoute,
    // Inyecta el enrutador para la navegación
    private router: Router,
    // Inyecta el servicio de productos
    private productosService: ProductosService,
    // Inyecta el servicio de mensajes de PrimeNG
    private messageService: MessageService
  ) {
    // Constructor

    // Inicializa el formulario con controles y validaciones
    this.form = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipo: ['', Validators.required],
      precio: ['', Validators.required],
      image: ['', Validators.required]
    });
  }

  // Muestra un mensaje de éxito
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Producto editado!', detail: 'Producto editado correctamente' });
  }

  // Muestra un mensaje de error con un mensaje personalizado
  showError(errorMsg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error al editar el producto!', detail: errorMsg });
  }

  ngOnInit(): void {
    // Método OnInit

    // Obtiene el producto de la propiedad 'productos' del estado de la ruta
    this.producto = history.state.productos;

    // Inicializa el formulario con los valores del producto actual o con cadenas vacías si no hay producto
    this.form = this.formBuilder.group({
      nombre: [this.producto?.nombre || '', Validators.required],
      descripcion: [this.producto?.descripcion || '', Validators.required],
      tipo: [this.producto?.tipo || '', Validators.required],
      precio: [this.producto?.precio || '', Validators.required],
      image: [this.producto?.image || '', Validators.required]
    });
  }

  // Actualiza el producto
  updateProducto(): void {
    // Verifica si el formulario es inválido o si no hay producto
    if (this.form.invalid || !this.producto) {
      return;
    }

    // Construye el objeto actualizado del producto
    const updatedProduct: Productos = {
      id: this.producto.id,
      ...this.form.value
    };

    // Llama al servicio para actualizar el producto
    this.productosService.updatePlayer(updatedProduct)
      .then(() => {
        // Éxito al actualizar, muestra un mensaje de éxito y redirige después de 2 segundos
        console.log('Producto actualizado');
        this.showSuccess();
        setTimeout(() => {
          this.router.navigateByUrl('/administrador/productos');
        }, 2000);
      })
      .catch((error) => {
        // Maneja errores y muestra un mensaje de error con detalles
        console.error('Error al actualizar el producto', error);
        this.showError('Error, no se pudo crear la cuenta. Intentelo más tarde');
      });
  }
}
