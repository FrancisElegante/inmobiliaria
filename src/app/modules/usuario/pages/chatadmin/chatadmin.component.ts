// Importaciones necesarias desde Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Importaciones de servicios y modelos
import { MensajeriaService } from '../../../../shared/services/mensajeria.service';
import { User } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../../../../shared/services/user.service';

@Component({
  selector: 'app-chatadmin',
  templateUrl: './chatadmin.component.html',
  styleUrls: ['./chatadmin.component.css']
})
export class ChatadminComponent {
  // Declaración de variables
  conversationId: string | null = null; // ID de la conversación
  messages: any[] = []; // Mensajes de la conversación
  newMessage: string = ''; // Nuevo mensaje a enviar
  receiverId: string | undefined; // ID del destinatario
  user: User | null = null; // Usuario logueado
  login: boolean = false; // Estado de inicio de sesión
  sendingMessage: boolean = false; // Estado de envío de mensaje

  // Constructor con inyección de servicios
  constructor(
    private route: ActivatedRoute,
    private mensajeriaService: MensajeriaService,
    private auth: Auth,
    private userService: UserService,
  ) {
    // Verificar el estado de inicio de sesión del usuario
    this.userService.isLoggedIn().subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        console.log('El usuario está logueado');
        // Realiza las acciones necesarias cuando el usuario está logueado
        this.login = true;
        // Obtener el usuario logueado
        this.user = this.auth.currentUser;
      } else {
        console.log('El usuario no está logueado');
        // Realiza las acciones necesarias cuando el usuario no está logueado
        this.login = false;
      }
    });
  }

  // Método para convertir un timestamp a una fecha
  timestampToDate(timestamp: any): Date {
    return timestamp.toDate();
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    // Obtener el ID de la conversación desde los parámetros de la ruta
    this.route.paramMap.subscribe((params) => {
      this.conversationId = params.get('id');

      if (this.conversationId) {
        // Cargar mensajes de la conversación y ordenarlos por fecha y hora
        this.mensajeriaService.getMessages(this.conversationId).subscribe((messages) => {
          this.messages = messages.sort((a, b) => a.timestamp - b.timestamp);

          // Marcar los mensajes como leídos al cargarlos
          this.markMessagesAsRead();
        });
      }
    });
  }

  // Método para marcar los mensajes como leídos
  markMessagesAsRead(): void {
    this.messages.forEach((message) => {
      if (message.senderId !== this.user!.uid && !message.isRead) {
        message.isRead = true;
  
        // Llama al servicio para actualizar el estado en la base de datos
        this.mensajeriaService.markMessageAsRead(this.conversationId!, message.id);
      }
    });
  }

  // Método para enviar un mensaje
  enviarMensaje() {
    if (this.newMessage.trim() !== '' && !this.sendingMessage) {
      this.sendingMessage = true;

      const message = {
        text: this.newMessage,
        timestamp: new Date(),
        isRead: false,
      };

      const adminId = 'f8NY7Pje62hOdmsElVBHCdv86Iw2'; // Reemplaza con el ID real del administrador
      this.mensajeriaService.sendMessageToAdmin(this.conversationId!, message, adminId)
        .then(() => {
          this.newMessage = '';
          this.sendingMessage = false;
        })
        .catch(error => {
          console.error('Error al enviar el mensaje:', error);
          this.sendingMessage = false;
        });
    }
  }
}
