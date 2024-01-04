// Importaciones necesarias desde Angular y Firebase
import { AfterViewInit, Component, ElementRef, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';

// Importaciones relacionadas con Firebase y Firestore
import { Firestore, collection, doc, setDoc, DocumentReference } from '@angular/fire/firestore';

// Importaciones relacionadas con el enrutamiento
import { ActivatedRoute, Router } from '@angular/router';

// Importaciones de servicios propios
import { ProductosService } from 'src/app/shared/services/productos.service';
import { UserService } from 'src/app/shared/services/user.service';
import { MensajeriaService } from 'src/app/shared/services/mensajeria.service';

// Importaciones de modelos
import { Productos } from 'src/app/models/productos.interface';
import { User as UserInterface } from "../../../../models/user.interface";

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  // Declaración de variables
  users$!: Observable<User[]>; // Observable para usuarios
  login: boolean = false; // Indica si el usuario está logueado o no
  rol: 'comprador' | 'admin' = 'comprador'; // Rol del usuario, inicializado como 'comprador'
  nombreusuario: string = ''; // Nombre del usuario
  apellidousuario: string = ''; // Apellido del usuario
  fotousuario: string = ''; // URL de la foto del usuario
  _router = inject(Router); // Inyección del servicio de enrutamiento

  // Constructor con inyección de servicios y dependencias
  constructor(
    private elementRef: ElementRef,
    private auth: Auth,
    private userService: UserService,
    private firestore: Firestore,
    private _mensajeriaService: MensajeriaService
  ) {
    // Suscripción para verificar el estado de inicio de sesión del usuario
    this.userService.isLoggedIn().subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        console.log('El usuario está logueado');
        // Realiza las acciones necesarias cuando el usuario está logueado
        this.login = true;
        // Obtener el UID del usuario logueado
        const user = this.auth.currentUser;
        if (user) {
          const uid = user.uid;
          this.getDatosUser3(uid); // Pasar el UID a la función
        }
      } else {
        console.log('El usuario no está logueado');
        // Realiza las acciones necesarias cuando el usuario no está logueado
        this.login = false;
      }
    });
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {}

  // Método para obtener datos del usuario por UID
  getDatosUser3(uid: string | undefined) {
    if (uid) {
      // Suscripción al servicio para obtener el usuario por UID
      this.userService.getUserByUid(uid).subscribe(user => {
        if (user) {
          console.log('Usuario encontrado:', user);
          this.nombreusuario = user.nombre;
          console.log('Rol usuario', user.rol);
          console.log(user.imagen);
          // Realiza las acciones necesarias con los datos del usuario
          this.apellidousuario = user.apellido;
          this.fotousuario = user.imagen;
          if (user.rol === 'comprador' || user.rol === 'admin') {
            this.rol = user.rol;
          } else {
            this.rol = 'comprador'; // Valor predeterminado en caso de rol inválido
          }
        } else {
          console.log('Usuario no encontrado');
          // Realiza las acciones necesarias si el usuario no existe
        }
      });
    }
  }

  // Método para editar un usuario
  editUser(user: User) {
    this._router.navigateByUrl('/misdatos', { state: { user } });
  }

  // Método para enviar un mensaje
  enviarMensaje() {
    const user = this.auth.currentUser;
    const conversationId = user!.uid;
    console.log(conversationId);
    this._mensajeriaService.iniciarConversacion(conversationId);
    this._router.navigate(['/usuario/chatadmin', conversationId]);
    this._mensajeriaService.setReceiverId(conversationId); // Asegúrate de tener un método en el servicio para establecer el receiverId
  }
}
