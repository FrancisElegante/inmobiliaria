// Importa las dependencias necesarias desde Angular y otras librerías
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { Firestore} from '@angular/fire/firestore';
import { AfterViewInit, ElementRef, OnInit, inject } from '@angular/core';

// Importa el servicio de usuario
import { UserService } from '../../../../shared/services/user.service';

// Define el componente de la barra de navegación
@Component({
  selector: 'app-navbarreal',
  templateUrl: './navbarreal.component.html',
  styleUrls: ['./navbarreal.component.css']
})
export class NavbarrealComponent {

  // Inicializa las variables de usuario, estado de inicio de sesión y rol
  user: User | null = null; // Inicializa con null
  login: boolean = false;
  rol: 'comprador' | 'admin' = 'comprador';

  // Constructor del componente
  constructor(
    private elementRef: ElementRef,
    private auth: Auth,
    private userService: UserService,
    private firestore: Firestore,
    private router: Router
  ) {
    // Suscribe al estado de inicio de sesión del usuario
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

  // Obtiene los datos del usuario por su UID
  getDatosUser3(uid: string | undefined) {
    if (uid) {
      this.userService.getUserByUid(uid).subscribe(user => {
        if (user) {
          console.log('Usuario encontrado:', user);
          console.log('Rol usuario', user.rol);

          // Establece el rol del usuario
          if (user.rol === 'comprador' || user.rol === 'admin') {
            this.rol = user.rol;
          } else {
            this.rol = 'comprador'; // Valor predeterminado en caso de rol inválido
          }
        } else {
          console.log('Usuario no encontrado');
        }
      });
    }
  }

  // Método para cerrar sesión
  cerrarSesion() {
    window.location.reload(); // Recarga la página al cerrar sesión
    this.userService.logout()
      .then(() => {
        this.router.navigate(['/register']); // Navega a la página de registro después de cerrar sesión
      })
      .catch(error => console.log(error));
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
  }

}
