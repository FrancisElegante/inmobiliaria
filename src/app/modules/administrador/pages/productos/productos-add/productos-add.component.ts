import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { Router } from '@angular/router';

import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-productos-add',
  templateUrl: './productos-add.component.html',
  styleUrls: ['./productos-add.component.css'],
  providers: [MessageService]
})
export class ProductosAddComponent implements OnInit {
  // Formulario reactivo para la adición de productos
  formulario: FormGroup;

  // Inyecta el enrutador
  _router = inject(Router);

  // Array de mensajes inicializado como vacío
  messages: Message[] = [];

  constructor(
    // Inyecta el servicio de productos, el enrutador y el servicio de mensajes de PrimeNG
    private productosService: ProductosService,
    private router: Router,
    private messageService: MessageService
  ) {
    // Constructor

    // Inicializa el formulario reactivo con controles y validaciones
    this.formulario = new FormGroup({
      nombre: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      tipo: new FormControl('', Validators.required),
      image: new FormControl('', Validators.required),
      precio: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    // Método OnInit
  }

  // Muestra un mensaje de éxito
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Producto agregado!', detail: 'Producto creado correctamente' });
  }

  // Muestra un mensaje de error con un mensaje personalizado
  showError(errorMsg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error al agregar el producto!', detail: errorMsg });
  }

  // Maneja la acción de enviar el formulario
  async onSubmit() {
    try {
      // Crea un nuevo producto con un ID único basado en la marca de tiempo actual
      const nuevoProducto = {
        id: Date.now().toString(),
        ...this.formulario.value
      };

      // Envía la solicitud para agregar el nuevo producto
      const response = await this.productosService.addPlayer(nuevoProducto);
      console.log(response);

      // Muestra un mensaje de éxito y redirige después de 2 segundos
      this.showSuccess();
      setTimeout(() => {
        this.router.navigate(['/administrador/productos']);
      }, 2000);
    } catch (error) {
      // Maneja errores y muestra un mensaje de error con detalles
      console.error('Error al enviar la solicitud:', error);
      this.showError('Error, no se pudo crear la cuenta. Intentelo más tarde');
    }
  }
}
