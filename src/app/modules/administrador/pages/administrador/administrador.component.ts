import { AfterViewInit, Component, ElementRef, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';

import { ProductosService } from 'src/app/shared/services/productos.service';
import { Productos } from 'src/app/models/productos.interface';

import { debounceTime, Observable } from 'rxjs';

import { User as Userinterface } from "src/app/models/user.interface";
import { UserService } from "src/app/shared/services/user.service";

import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, setDoc, getDoc, DocumentReference } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css']
})
export class AdministradorComponent implements OnInit {
  // Observable que contendrá la lista de usuarios
  users$!: Observable<User[]>;

  // Variable para rastrear el estado de inicio de sesión
  login: boolean = false;

  // Rol del usuario, puede ser 'comprador' o 'admin'
  rol: 'comprador' | 'admin' = 'comprador';

  // Información del usuario logueado
  nombreusuario: string = '';
  apellidousuario: string = '';
  fotousuario: string = '';

  // Objeto Router inyectado para la navegación
  _router = inject(Router);

  constructor(
    // Inyecta elementos necesarios en el constructor
    private elementRef: ElementRef,
    private auth: Auth,
    private userService: UserService,
    private firestore: Firestore
  ) {
    // Constructor

    // Suscribe al estado de inicio de sesión del usuario
    this.userService.isLoggedIn().subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        // El usuario está logueado
        console.log('El usuario está logueado');
        this.login = true;

        // Obtiene el usuario actual y su UID
        const user = this.auth.currentUser;
        if (user) {
          const uid = user.uid;

          // Llama a la función para obtener y mostrar los datos del usuario
          this.getDatosUser3(uid);
        }
      } else {
        // El usuario no está logueado
        console.log('El usuario no está logueado');
        this.login = false;
      }
    });
  }

  ngOnInit() {
    // Método OnInit
  }

  /**
   * Obtiene los datos del usuario utilizando su UID.
   * @param uid UID del usuario.
   */
  getDatosUser3(uid: string | undefined) {
    // Aceptar un UID como parámetro
    if (uid) {
      // Suscribe a la función que obtiene los datos del usuario por su UID
      this.userService.getUserByUid(uid).subscribe(user => {
        if (user) {
          // Usuario encontrado

          // Muestra información en la consola
          console.log('Usuario encontrado:', user);

          // Asigna datos del usuario a las variables del componente
          this.nombreusuario = user.nombre;
          console.log('Rol usuario', user.rol);
          this.apellidousuario = user.apellido;
          this.fotousuario = user.imagen;

          // Verifica y asigna el rol del usuario
          if (user.rol === 'comprador' || user.rol === 'admin') {
            this.rol = user.rol;
          } else {
            this.rol = 'comprador'; // Valor predeterminado en caso de rol inválido
          }
        } else {
          // Usuario no encontrado
          console.log('Usuario no encontrado');
          // Puedes realizar acciones adicionales si el usuario no existe
        }
      });
    }
  }

  /**
   * Redirige a la página de edición de datos del usuario.
   * @param user Usuario a editar.
   */
  editUser(user: User) {
    // Redirige a la página de edición de datos del usuario, pasando el usuario como estado
    this._router.navigateByUrl('/misdatos', { state: { user } });
  }
}
