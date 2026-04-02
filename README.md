# Sistema de Estacionamiento Inteligente

Esta aplicación fue desarrollada con Ionic + Angular, permite gestionar un estacionamiento mediante escaneo de QR, registro manual de vehículos y control en tiempo real desde un panel de administrador.

# Requisitos previos

Antes de clonar el repositorio debes tener instalado:
-Node.js. Versión recomendada: 18 o superior
-npm (incluido con Node)
-Ionic CLI

Instalar Ionic CLI globalmente:

npm install -g @ionic/cli


# Clonar el repositorio

En la terminal clona este repositorio:

git clone https://github.com/NohemiMimi/SistemaEstacionamiento.git


Entra a la carpeta del proyecto:

cd SistemaEstacionamiento


# Instalar dependencias

Instala todas las dependencias necesarias:

npm install


# Ejecutar la aplicación

Para iniciar la app en modo desarrollo:

ionic serve

Esto abrirá automáticamente la aplicación en el navegador en:

http://localhost:8100

# Ejecutar en dispositivo móvil 

Si deseas correr la app en tu celular:


ionic capacitor add android
ionic capacitor run android


O para iOS:


ionic capacitor add ios
ionic capacitor run ios

# Configuración del backend

Revisar que el backend este corriendo correctamente

Revisa la URL del API en tu servicio (`ApiService`) y verifica que apunte al servidor correcto.

Ejemplo:

baseUrl = 'http://localhost:5000';


# Funcionalidades principales

-Registro de entrada mediante QR
-Registro manual de vehículos
-Cálculo automático de cobro
-Panel de administrador con estadísticas
-Escaneo de QR para salida
-Generación de códigos QR para usuarios


# Tecnologías utilizadas

-Ionic
-Angular
-Capacitor
-TypeScript
-Backend (Flask / API REST)
-MongoDB


# Autor

Desarrollado como proyecto académico.


# Notas

Asegúrate de tener permisos de cámara para el escaneo de QR
El backend debe estar activo para el correcto funcionamiento
Compatible con navegador y dispositivos móviles
