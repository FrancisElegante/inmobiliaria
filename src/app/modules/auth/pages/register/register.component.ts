// Importa las dependencias necesarias desde Angular y otras librerías
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

// Importa el servicio de usuario
import { UserService } from '../../../../shared/services/user.service';

// Importa los módulos de mensajes de PrimeNG
import { MessageModule } from 'primeng/message';
import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';

// Define el componente de registro
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [MessageService]
})
export class RegisterComponent implements OnInit {
  // Inicializa el formulario reactivo para el registro
  formReg: FormGroup;

  // Inyecta el enrutador
  _router = inject(Router);

  // Variable para almacenar el valor actual
  value!: string;

  // Inicializa messages como un array vacío
  messages: Message[] = [];

  // Constructor del componente
  constructor(
    private userService: UserService,
    private messageService: MessageService
  ) {
    // Configura el formulario reactivo con sus respectivos campos y validaciones
    this.formReg = new FormGroup({
      nombre: new FormControl('', [
        Validators.required,
      ]),
      rol: new FormControl('comprador'),
      apellido: new FormControl('', [
        Validators.required,
      ]),
      sexo: new FormControl('', [
        Validators.required,
      ]),
      edad: new FormControl('', [
        Validators.required,
      ]),
      email: new FormControl('', [
        Validators.required,
        this.emailValidator()
      ]),
      imagen: new FormControl(),
      password: new FormControl('', [
        Validators.required,
        this.passwordValidator(),
      ]),
      contraseña2: new FormControl('', Validators.required),
    }, { validators: this.matchingPasswordsValidator('password', 'contraseña2') });
  }

  // Muestra un mensaje de éxito
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Cuenta Creada!', detail: 'Cuenta creada correctamente' });
  }

  // Muestra un mensaje de error
  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error al crear la cuenta!', detail: 'Error, no se pudo crear la cuenta. Intentelo mas tarde' });
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    // Inicializa messages con un mensaje de error
    this.messages = [{ severity: 'error', summary: 'Error', detail: 'Closable Message Content' }];
  }

  // Validador personalizado para el campo de correo electrónico
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailValue: string = control.value;
      const isValid = emailValue.includes('@');
      return isValid ? null : { requiresAtSymbol: true };
    };
  }

  // Validador personalizado para el campo de contraseña
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordValue: string = control.value;
      const isValid = passwordValue.length >= 6;
      return isValid ? null : { passwordTooShort: true };
    };
  }

  // Validador para asegurarse de que las contraseñas coincidan
  matchingPasswordsValidator(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField)?.value;
      const confirmPassword = control.get(confirmPasswordField)?.value;
      return password === confirmPassword ? null : { passwordsDoNotMatch: true };
    };
  }

  // Método para mostrar una alerta (puede eliminarse si no se utiliza)
  mostraralerta() {
    alert('¡Formulario enviado!');
  }

  // Método que se ejecuta al enviar el formulario de registro
  onSubmit(): void {
    // Intenta registrar al usuario y maneja las respuestas y errores
    this.userService.register(this.formReg.value)
      .then(response => {
        console.log(response);
        console.log("Éxito al crear usuario");

        // Obtiene el UID del usuario registrado
        const uid = response.user.uid;

        // Guarda los datos adicionales en Firestore
        this.userService.guardarDatos(uid, this.formReg.value)
          .then(() => {
            console.log("Datos guardados en Firestore");
            this.showSuccess();

            // Navega a la página de inicio de sesión después de un tiempo
            setTimeout(() => {
              this._router.navigate(['/auth/login']);
            }, 2000);
          })
          .catch(error => {
            console.log("Error al guardar los datos en Firestore:", error);
            this.showError();
          });
      })
      .catch(error => {
        console.log(error);
        console.log("Fallo al crear usuario");
        this.showError();
      });
  }
}
