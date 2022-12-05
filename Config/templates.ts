import { userInterface } from '../types'

export const userTemplate: userInterface = {
  taxid: '',
  country: '',
  token: '',
  APIMSTOKEN: '',
  cleanTaxId: '',
  decimales: 2,
  fetchUser: '',
  infoFiscalUser: {},
  logos: {
    logoGeneral: '',
    logoPorEstablecimiento: {}
  },
  perfiles: [],
  requestor: '',
  sharedData: {},
  talonarioContingencia: {},
  urls: {},
  userName: '',
  clientes: [],
  configuracionApp: [],
  configuracionGeneral: {
    actionsInRealTime: false,
    windowsInRealTime: false
  },
  establecimientos: [],
  MIPOS: {},
  permisos: {},
  productos: [],
  tipoPersoneria: '',
  usuarios: []
}

export const fatherAccessTemplate = {
  GT: {
    'API-ASMX': {
      granted: true
    },
    Administrador: {
      granted: true
    },
    Clientes: {
      granted: true
    },
    Consultas: {
      granted: true
    },
    Dashboard: {
      granted: true
    },
    'Facturacion Batch': {
      granted: true
    },
    'Facturacion Individual': {
      granted: true
    },
    Productos: {
      granted: true
    },
    Reportes: {
      granted: true
    },
    'Subsidio Combustible': {
      granted: true
    }
  },
  PA: {
    'API-ASMX': {
      granted: true
    },
    Administrador: {
      granted: true
    },
    Clientes: {
      granted: true
    },
    Consultas: {
      granted: true
    },
    Dashboard: {
      granted: true
    },
    'Facturacion Batch': {
      granted: true
    },
    'Facturacion Individual': {
      granted: true
    },
    Productos: {
      granted: true
    },
    Reportes: {
      granted: true
    },
    'Subsidio Combustible': {
      granted: true
    },
    'PADRE EXTRA': {
      granted: false
    }
  }
}

export const actionsPermissionsTemplate = {
  GT: {
    Administrador: {
      'Asignar Establecimiento': {
        granted: true
      },
      'Cambiar Representacion Grafica': {
        granted: true
      },
      'Editar Usuarios': {
        granted: true
      },
      'Eliminar Usuarios': {
        granted: true
      },
      Plan: {
        granted: true
      },
      'Representaciones graficas': true,
      'Subir Logo': {
        granted: true
      },
      Usuarios: {
        granted: true
      }
    },
    Clientes: {
      Consultar: {
        granted: true
      },
      'Crear Nuevo': {
        granted: true
      },
      Editar: {
        granted: true
      },
      Eliminar: {
        granted: true
      }
    },
    Consultas: {
      Anular: {
        granted: true
      },
      Email: {
        granted: true
      },
      Facturar: {
        granted: true
      },
      'Nota de Credito': {
        granted: true
      }
    },
    'Facturacion Individual': {
      'Factura Basica': {
        granted: true
      },
      'Facturas con Exento': {
        granted: true
      },
      'Notas De Credito': {
        granted: true
      },
      'Notas De Debito': {
        granted: true
      },
      'Pago en Efectivo': {
        granted: true
      },
      'Sin exportacion': {
        granted: true
      },
      'PERMISO EXTRA DE TEST': {
        granted: true
      }
    },
    Productos: {
      Consultar: {
        granted: true
      },
      'Crear Nuevo': {
        granted: true
      },
      Eliminar: {
        granted: true
      },
      'Modificar Descripcion': {
        granted: true
      },
      'Modificar Precio': {
        granted: true
      }
    }
  },
  PA: {
    Administrador: {
      'Asignar Establecimiento': {
        granted: true
      },
      'Cambiar Representacion Grafica': {
        granted: true
      },
      'Editar Usuarios': {
        granted: true
      },
      'Eliminar Usuarios': {
        granted: true
      },
      Plan: {
        granted: true
      },
      'Representaciones graficas': true,
      'Subir Logo': {
        granted: true
      },
      Usuarios: {
        granted: true
      }
    },
    Clientes: {
      Consultar: {
        granted: true
      },
      'Crear Nuevo': {
        granted: true
      },
      Editar: {
        granted: true
      },
      Eliminar: {
        granted: true
      }
    },
    Consultas: {
      Anular: {
        granted: true
      },
      Email: {
        granted: true
      },
      Facturar: {
        granted: true
      },
      'Nota de Credito': {
        granted: true
      }
    },
    'Facturacion Individual': {
      'Factura Basica': {
        granted: true
      },
      'Facturas con Exento': {
        granted: true
      },
      'Notas De Credito': {
        granted: true
      },
      'Notas De Debito': {
        granted: true
      },
      'Pago en Efectivo': {
        granted: true
      },
      'Sin exportacion': {
        granted: true
      },
      'PERMISO EXTRA DE TEST': {
        granted: true
      }
    },
    Productos: {
      Consultar: {
        granted: true
      },
      'Crear Nuevo': {
        granted: true
      },
      Eliminar: {
        granted: true
      },
      'Modificar Descripcion': {
        granted: true
      },
      'Modificar Precio': {
        granted: true
      }
    }
  }
}
