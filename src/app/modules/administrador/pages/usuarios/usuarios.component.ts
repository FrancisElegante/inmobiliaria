import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, Observable } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Importa el operador switchMap
import { switchMap } from 'rxjs/operators';

// Importa los servicios necesarios
import { ProductosService } from 'src/app/shared/services/productos.service';
import { Productos } from 'src/app/models/productos.interface';
import { MensajeriaService } from 'src/app/shared/services/mensajeria.service';

// Importa el modelo de usuario
import { User } from 'src/app/models/user.interface';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  // Observable que contendrá la lista de productos
  productos$!: Observable<Productos[]>;

  // Inyecta el servicio de productos
  _productosService = inject(ProductosService);

  // Inyecta el enrutador
  _router = inject(Router);

  // Control para la barra de búsqueda de usuarios
  searcher = new FormControl('');

  // Inyecta el servicio de mensajería
  _mensajeriaService = inject(MensajeriaService);

  // Observable que contendrá la lista de usuarios
  usuarios$!: Observable<User[]>;

  ngOnInit(): void {
    // Método OnInit

    // Obtén todos los usuarios al principio
    this.usuarios$ = this._productosService.getUsuarios(); // Sin filtro inicial

    // Suscríbete a los cambios en el valor de la barra de búsqueda con un debounce de 500 ms
    this.searcher.valueChanges.pipe(debounceTime(500)).subscribe((search) => {
      // Obtén los usuarios con el término de búsqueda actual
      this.usuarios$ = this._productosService.getUsuarios(search || '');
    });
  }

  // Método para enviar mensajes a un usuario
  enviarMensaje(usuario: User) {
    // Obtén el ID de conversación usando el UID del usuario
    const conversationId = usuario.uid;

    // Inicia la conversación en el servicio de mensajería
    this._mensajeriaService.iniciarConversacion(conversationId);

    // Navega a la página de chat con el ID de conversación
    this._router.navigate(['/administrador/chat', conversationId]);

    // Establece el ID del receptor en el servicio de mensajería
    this._mensajeriaService.setReceiverId(conversationId); // Asegúrate de tener un método en el servicio para establecer el receiverId
  }
}
