import { countriesDictionaryType, FELDocumentTypes, ServiceFetchProps } from '../types'

export const LoginCountries: Array<countriesDictionaryType> = [
  {
    name_en: '-- Seleccione un pais --',
    name_es: '-- Seleccione un pais --',
    dial_code: '',
    code: ''
  },
  {
    name_en: 'Guatemala',
    name_es: 'Guatemala',
    dial_code: '+502',
    code: 'GT'
  },
  {
    name_en: 'Panama',
    name_es: 'Panamá',
    dial_code: '+507',
    code: 'PA'
  }
]

export const months: string[] = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

export const tiposDocumentoPA: FELDocumentTypes[] = [
  { name: 'Factura de Operación Interna', no: '01', code: '01' },
  { name: 'Factura de Importación', no: '02', code: '02' },
  { name: 'Factura de Exportación', no: '03', code: '03' },
  { name: 'Nota de Crédito Referente a una o Varias FE', no: '04', code: '04' },
  { name: 'Nota de Débito Referente a una o Varias FE', no: '05', code: '05' },
  { name: 'Nota de Crédito Genérica', no: '06', code: '06' },
  { name: 'Nota de Débito Genérica', no: '07', code: '07' },
  { name: 'Nota de Zona Franca', no: '08', code: '08' },
  { name: 'Reembolso', no: '09', code: '09' }
]
export const tiposDocumentoGT: {
  [key: string]: FELDocumentTypes[]
} = {
  GEN: [
    {
      no: 1,
      code: 'FACT',
      name: 'Factura'
    },
    {
      no: 2,
      code: 'FCAM',
      name: 'Factura Cambiaria'
    },
    {
      no: 9,
      code: 'NCRE',
      name: 'Nota de Credito'
    },
    {
      no: 10,
      code: 'NDEB',
      name: 'Nota de Debito'
    },
    {
      no: 6,
      code: 'RECI',
      name: 'Recibo'
    },
    {
      no: 5,
      code: 'RDON',
      name: 'Recibo de Donacion'
    }
  ],
  PEQ: [
    {
      no: 3,
      code: 'FPEQ',
      name: 'Factura Pequeño Contribuyente'
    },
    {
      no: 4,
      code: 'FCAP',
      name: 'Factura Cambiaria Pequeño Contribuyente'
    },
    {
      no: 6,
      code: 'RECI',
      name: 'Recibo'
    }
  ],
  PEE: [
    {
      no: 13,
      code: 'FAPE',
      name: 'Factura Pequeño Contribuyente Regimen Electronico'
    },
    {
      no: 14,
      code: 'FCPE',
      name: 'Factura Cambiaria Pequeño Contribuyente Regimen Electronico'
    },
    {
      no: 6,
      code: 'RECI',
      name: 'Recibo'
    }
  ],
  AGR: [
    {
      no: 11,
      code: 'FACA',
      name: 'Factura Contribuyente Agropecuario'
    },
    {
      no: 12,
      code: 'FCCA',
      name: 'Factura Cambiaria Contribuyente Agropecuario'
    }
  ],
  AGE: [
    {
      no: 15,
      code: 'FAAE',
      name: 'Factura Contribuyente Agropecuario Regimen Electronico Especial'
    },
    {
      no: 16,
      code: 'FCAE',
      name: 'Factura Cambiaria Contribuyente Agropecuario Regimen Electronico Especial'
    }
  ],
  EXE: [
    {
      no: 6,
      code: 'RECI',
      name: 'Recibo'
    },
    {
      no: 5,
      code: 'RDON',
      name: 'Recibo de Donacion'
    }
  ]
}

// ------------ MODELO PA ----------------
// obj.id = e.IDCustomer
// obj.countryCode = e.SCountryCode
// obj.tipoCliente = e.TipoCliente
// obj.cTaxId = e.CTaxID
// obj.DV = e.DV
// obj.nombreOrga = e.NombreOrganizacion
// obj.nombreContacto = e.NombreContacto
// obj.cargo = e.Cargo
// obj.telefono = e.Telefono
// obj.correo = e.Correo
// obj.direccion = e.Direccion1
// obj.provincia = e.Provincia
// obj.distrito = e.Distrito
// obj.corregimiento = e.Corregimiento
// ----------- MODELO GT ----------------
// id: e.IDCustomer || '',
// country: e.SCountryCode || '',
// sTaxId: e.STaxID || '',
// tipoCliente: e.TipoCliente || '',
// NIT: e.NIT || '',
// nombreOrga: e.NombreOrganizacion || '',
// nombreContacto: e.NombreContacto || '',
// cargo: e.Cargo || '',
// telefono: e.Telefono || '',
// correo: e.Correo || '',
// IDBitacoraCustomer: e.IDBitacoraCustomer || '',
// estado: e.status || '',
// fechaCreacion: e.fecha || '',
// observaciones: e.observaciones || '',
// direccion: e.Direccion1 || '',
// municipio: e.Municipio || '',
// departamento: e.Departamento || ''
export const clientFetchProps: ServiceFetchProps = {
  PA: {
    keys: [
      'id',
      'countryCode',
      'tipoCliente',
      'cTaxId',
      'DV',
      'nombreOrga',
      'nombreContacto',
      'cargo',
      'telefono',
      'correo',
      'direccion',
      'provincia',
      'distrito',
      'corregimiento'
    ],
    props: {
      id: 'IDCustomer',
      countryCode: 'SCountryCode',
      tipoCliente: 'TipoCliente',
      cTaxId: 'CTaxID',
      DV: 'DV',
      nombreOrga: 'NombreOrganizacion',
      nombreContacto: 'NombreContacto',
      cargo: 'Cargo',
      telefono: 'Telefono',
      correo: 'Correo',
      direccion: 'Direccion1',
      provincia: 'Provincia',
      distrito: 'Distrito',
      corregimiento: 'Corregimiento'
    }
  },
  GT: {
    keys: [
      'id',
      'countryCode',
      'sTaxId',
      'tipoCliente',
      'cTaxId',
      'nombreOrga',
      'nombreContacto',
      'telefono',
      'correo',
      'estado',
      'direccion',
      'municipio',
      'departamento'
    ],
    props: {
      id: 'IDCustomer',
      countryCode: 'SCountryCode',
      sTaxId: 'STaxID',
      tipoCliente: 'TipoCliente',
      cTaxId: 'NIT',
      nombreOrga: 'NombreOrganizacion',
      nombreContacto: 'NombreContacto',
      telefono: 'Telefono',
      correo: 'Correo',
      estado: 'status',
      direccion: 'Direccion1',
      municipio: 'Municipio',
      departamento: 'Departamento'
    }
  }
}

export const productFetchProps: ServiceFetchProps = {
  GT: {
    keys: [
      'name',
      'price',
      'unit',
      'tipo',
      'ean'
    ],
    props: {
      name: 'D',
      price: 'LP',
      tipo: 'CTG',
      unit: 'U',
      ean: 'EAN'
    }
  },
  PA: {
    keys: [
      'country',
      'taxid',
      'name',
      'price',
      'unit',
      'impuestos',
      'ean',
      'segmento',
      'familia'
    ],
    props: {
      country: 'CC',
      taxid: 'TID',
      name: 'D',
      price: 'LP',
      unit: 'U',
      impuestos: 'CTG',
      ean: 'EAN',
      segmento: 'CPBMSabr',
      familia: 'CPBMS'
    }
  }
}

export const sharedDataFetchProps: ServiceFetchProps = {
  GT: {
    keys: [
      'taxid',
      'name',
      'paquete',
      'creada',
      'expira',
      'estado',
      'email',
      'requestor'
    ],
    props: {
      taxid: 'NIT',
      name: 'Name',
      paquete: 'Paquete',
      creada: 'CreationDate',
      expira: 'Expira',
      estado: 'BundleExpired',
      email: 'email',
      requestor: 'RequestorGUID'
    }
  },
  PA: {
    keys: [
      'taxid',
      'name',
      'paquete',
      'creada',
      'expira',
      'estado',
      'email',
      'requestor',
      'restantes'
    ],
    props: {
      taxid: 'NIT',
      name: 'Name',
      paquete: 'Paquete',
      creada: 'CreationDate',
      expira: 'Expira',
      estado: 'BundleExpired',
      email: 'email',
      requestor: 'RequestorGUID',
      restantes: 'BundleRemain'
    }
  }
}
// ------------- INFO FISCAL GT MODEL ---------------
// nombre = rinf.Nom
// calle = rinf.Ca
// ciudad = rinf.cd
// zona = rinf.zon
// frases = rinf.FRASES
// afiliacion = rinf.AfiliacionIVA
// postalEstablecimientos = rinf.ESTCODPOSTAL
// establecimientos = establecimientosSpliter({ establecimientos: rinf.EST })
// dirEstablecimientos = rinf.ESTDIR
// cm = rinf.cm
// tipoPersoneria = rinf.TipoPersoneria
// nit = nit
export const infoFiscalFetchProps: ServiceFetchProps = {
  GT: {
    keys: [
      'nombre',
      'calle',
      'ciudad',
      'zona',
      'frases',
      'afiliacion',
      'postalEstablecimientos',
      'establecimientos',
      'dirEstablecimientos',
      'cm',
      'tipoPersoneria',
      'taxid'
    ],
    props: {
      nombre: 'Nom',
      calle: 'Ca',
      ciudad: 'cd',
      zona: 'zon',
      frases: 'FRASES',
      afiliacion: 'AfiliacionIVA',
      postalEstablecimientos: 'ESTCODPOSTAL',
      establecimientos: 'EST',
      dirEstablecimientos: 'ESTDIR',
      cm: 'cm',
      tipoPersoneria: 'TipoPersoneria',
      taxid: 'NIT'
    }
  },
  PA: {
    keys: [
      'razonSocial',
      'taxid',
      'tipoContribuyente',
      'dv',
      'calle',
      'provincia',
      'distrito',
      'corregimiento',
      'codProvincia',
      'codDistrito',
      'codCorregimiento'
    ],
    props: {
      razonSocial: 'Nom',
      taxid: 'TaxID',
      tipoContribuyente: 'TipoContribuyente',
      dv: 'DV',
      calle: 'CA',
      provincia: 'Provincia',
      distrito: 'Distrito',
      corregimiento: 'Corregimiento',
      codProvincia: 'CodProvincia',
      codDistrito: 'CodDistrito',
      codCorregimiento: 'CodCorregimiento'
    }
  }
}
// ----------------- ESTABLECIMIENTOS GT MODEL ------------------------
// id = e.idEstablecimiento || ''
// numero = e.ne || ''
// nombre = e.nombre || ''
// direccion = e.direccion || ''
// municipio = e.municipio || ''
// departamento = e.departamento || ''
// codPostal = e.codPostal || ''
// pais = e.pais || ''
// estado = e.Estado || ''
export const establecimientosFetchProps: ServiceFetchProps = {
  GT: {
    keys: [
      'id',
      'taxid',
      'numero',
      'nombre',
      'direccion',
      'municipio',
      'departamento',
      'codPostal',
      'pais',
      'estado'
    ],
    props: {
      id: 'idEstablecimiento',
      taxid: 'nit',
      numero: 'ne',
      nombre: 'nombre',
      direccion: 'direccion',
      municipio: 'municipio',
      departamento: 'departamento',
      codPostal: 'codPostal',
      pais: 'pais',
      estado: 'Estado'
    }
  },
  PA: {
    keys: [
      'nProvincia',
      'nDistrito',
      'nCorregimiento',
      'provincia',
      'distrito',
      'corregimiento',
      'direccion',
      'tipoSucursal',
      'coordenadas',
      'ne',
      'numero',
      'nombre',
      'taxid',
      'telefono'
    ],
    props: {
      nProvincia: 'NProvincia',
      nDistrito: 'NDistrito',
      nCorregimiento: 'NCorregimiento',
      provincia: 'provincia',
      distrito: 'distrito',
      corregimiento: 'corregimiento',
      direccion: 'Direccion',
      tipoSucursal: 'TipoSuc',
      coordenadas: 'Coordenadas',
      ne: 'NE',
      numero: 'NE',
      nombre: 'Nombre',
      taxid: 'TaxID',
      telefono: 'Telefono'
    }
  }
}

export const usersFetchProps: ServiceFetchProps = {
  GT: {
    // --------- GT MODEL ----------------------
    // <CC>GT</CC>
    // <TID>000000123456</TID>
    // <UN>Avalos20</UN>
    // <FN>Avalos</FN>
    // <LN>Avalos</LN>
    // <EM>carlos.casia@digifact.com.gt</EM>
    // <PH>12345678</PH>
    // <EXT>--</EXT>
    // <FAX>--</FAX>
    // <DR>0</DR>
    // <GR>274877906927</GR>
    keys: [
      'taxid',
      'country',
      'userName',
      'firstNames',
      'lastNames',
      'nombre',
      'email',
      'telefono',
      'GR'
    ],
    props: {
      taxid: 'TID',
      country: 'CC',
      userName: 'UN',
      firstNames: 'FN',
      lastNames: 'LN',
      nombre: '',
      email: 'EM',
      telefono: 'PH',
      GR: 'GR'
    }
  },
  PA: {
    // --------------- PA MODEL ----------------
    // <CC>PA</CC>
    // <TID>155704849-2-2021</TID>
    // <UN>CGonzales</UN>
    // <FN>Carlos</FN>
    // <LN>Gonzales</LN>
    // <EM>test@test.com</EM>
    // <PH>123456</PH>
    // <EXT />
    // <FAX />
    // <DR>0</DR>
    // <GR>274877906943</GR>
    keys: [
      'taxid',
      'country',
      'userName',
      'firstNames',
      'lastNames',
      'nombre',
      'email',
      'telefono',
      'GR'
    ],
    props: {
      taxid: 'TID',
      country: 'CC',
      userName: 'UN',
      firstNames: 'FN',
      lastNames: 'LN',
      nombre: '',
      email: 'EM',
      telefono: 'PH',
      GR: 'GR'
    }
  }
}

export const ITBMSDictionary: Array<{label: string, value: string, rate?: number}> = [
  {
    label: '-- Selecccione Tasa ITBMS  --',
    value: '-1'
  },
  {
    label: 'Tasa del 0% (Excento)',
    value: '00',
    rate: 0
  },
  {
    label: 'Tasa del 7%',
    value: '01',
    rate: 0.07
  },
  {
    label: 'Tasa del 10%',
    value: '02',
    rate: 0.1
  },
  {
    label: 'Tasa del 15%',
    value: '03',
    rate: 0.15
  }
]

export const clientsCustomFormCountry = ['PA', 'GT', '-1']

export const MunicipiosGT = {
  '': [
    '-- Selecccione un Municipio  --'
  ],
  'Alta Verapaz': [
    'Cahabón',
    'Chahal',
    'Chisec',
    'Cobán',
    'Fray Bartolomé de las Casas',
    'Lanquín',
    'Panzós',
    'Raxruha',
    'San Cristóbal Verapaz',
    'San Juan Chamelco',
    'San Pedro Carchá',
    'Santa Cruz Verapaz',
    'Senahú',
    'Tactic',
    'Tamahú',
    'Tucurú',
    'Santa Catarina La Tinta'
  ],
  'Baja Verapaz': [
    'Cubulco',
    'Granados',
    'Purulhá',
    'Rabinal',
    'Salamá',
    'San Jerónimo',
    'San Miguel Chicaj',
    'Santa Cruz El Chol'
  ],
  Chimaltenango: [
    'Acatenango',
    'Chimaltenango',
    'El Tejar',
    'Parramos',
    'Patzicía',
    'Patzún',
    'Pochuta',
    'San Andrés Itzapa',
    'San José Poaquil',
    'San Juan Comalapa',
    'San Martín Jilotepeque',
    'Santa Apolonia',
    'Santa Cruz Balanyá',
    'Tecpán Guatemala',
    'Yepocapa',
    'Zaragoza'
  ],
  Chiquimula: [
    'Camotán',
    'Chiquimula',
    'Concepción Las Minas',
    'Esquipulas',
    'Ipala',
    'Jocotán',
    'Olopa',
    'Quezaltepeque',
    'San Jacinto',
    'San José La Arada',
    'San Juan Ermita'
  ],
  'El Progreso': [
    'El Jícaro',
    'Guastatoya',
    'Morazán',
    'San Agustín Acasaguastlán',
    'San Antonio La Paz',
    'San Cristóbal Acasaguastlán',
    'Sanarate'
  ],
  Escuintla: [
    'Escuintla',
    'Guanagazapa',
    'Iztapa',
    'La Democracia',
    'La Gomera',
    'Masagua',
    'Nueva Concepción',
    'Palín',
    'San José',
    'San Vicente Pacaya',
    'Santa Lucía Cotzumalguapa',
    'Siquinalá',
    'Tiquisate'
  ],
  Guatemala: [
    'Amatitlán',
    'Chinautla',
    'Chuarrancho',
    'Fraijanes',
    'Guatemala',
    'Mixco',
    'Palencia',
    'Petapa',
    'San José del Golfo',
    'San José Pinula',
    'San Juan Sacatepéquez',
    'San Pedro Ayampuc',
    'San Pedro Sacatepéquez',
    'San Raymundo',
    'Santa Catarina Pinula',
    'Villa Canales',
    'Villa Nueva'
  ],
  Huehuetenango: [
    'Aguacatán',
    'Chiantla',
    'Colotenango',
    'Concepción Huista',
    'Cuilco',
    'Huehuetenango',
    'Ixtahuacán',
    'Jacaltenango',
    'La Democracia',
    'La Libertad',
    'Malacatancito',
    'Nentón',
    'San Antonio Huista',
    'San Gaspar Ixchil',
    'San Juan Atitán',
    'San Juan Ixcoy',
    'San Mateo Ixtatán',
    'San Miguel Acatán',
    'San Pedro Necta',
    'San Rafael La Independencia',
    'San Rafael Petzal',
    'San Sebastián Coatán',
    'San Sebastián Huehuetenango',
    'Santa Ana Huista',
    'Santa Bárbara',
    'Santa Cruz Barillas',
    'Santa Eulalia',
    'Santiago Chimaltenango',
    'Soloma',
    'Tectitán',
    'Todos Santos Cuchumatan'
  ],
  Izabal: [
    'El Estor',
    'Livingston',
    'Los Amates',
    'Morales',
    'Puerto Barrios'
  ],
  Jutiapa: [
    'Agua Blanca',
    'Asunción Mita',
    'Atescatempa',
    'Comapa',
    'Conguaco',
    'El Adelanto',
    'El Progreso',
    'Jalpatagua',
    'Jerez',
    'Jutiapa',
    'Moyuta',
    'Pasaco',
    'Quezada',
    'San José Acatempa',
    'Santa Catarina Mita',
    'Yupiltepeque',
    'Zapotitlán'
  ],
  Petén: [
    'Dolores',
    'Flores',
    'La Libertad',
    'Melchor de Mencos',
    'Poptún',
    'San Andrés',
    'San Benito',
    'San Francisco',
    'San José',
    'San Luis',
    'Santa Ana',
    'Sayaxché',
    'Las Cruces',
    'El Chal'
  ],
  Quetzaltenango: [
    'Almolonga',
    'Cabricán',
    'Cajolá',
    'Cantel',
    'Coatepeque',
    'Colomba',
    'Concepción Chiquirichapa',
    'El Palmar',
    'Flores Costa Cuca',
    'Génova',
    'Huitán',
    'La Esperanza',
    'Olintepeque',
    'Ostuncalco',
    'Palestina de Los Altos',
    'Quetzaltenango',
    'Salcajá',
    'San Carlos Sija',
    'San Francisco La Unión',
    'San Martín Sacatepéquez',
    'San Mateo',
    'San Miguel Sigüilá',
    'Sibilia',
    'Zunil'
  ],
  Quiché: [
    'Canillá',
    'Chajul',
    'Chicamán',
    'Chiché',
    'Chichicastenango',
    'Chinique',
    'Cunén',
    'Ixcán',
    'Joyabaj',
    'Nebaj',
    'Pachalum',
    'Patzité',
    'Sacapulas',
    'San Andrés Sajcabajá',
    'San Antonio Ilotenango',
    'San Bartolomé Jocotenango',
    'San Juan Cotzal',
    'San Pedro Jocopilas',
    'Santa Cruz del Quiché',
    'Uspantán',
    'Zacualpa'
  ],
  Retalhuleu: [
    'Champerico',
    'El Asintal',
    'Nuevo San Carlos',
    'Retalhuleu',
    'San Andrés Villa Seca',
    'San Felipe',
    'San Martín Zapotitlán',
    'San Sebastián',
    'Santa Cruz Muluá'
  ],
  Sacatepéquez: [
    'Alotenango',
    'Antigua',
    'Ciudad Vieja',
    'Jocotenango',
    'Magdalena Milpas Altas',
    'Pastores',
    'San Antonio Aguas Calientes',
    'San Bartolomé Milpas Altas',
    'San Lucas Sacatepéquez',
    'San Miguel Dueñas',
    'Santa Catarina Barahona',
    'Santa Lucía Milpas Altas',
    'Santa María de Jesús',
    'Santiago Sacatepéquez',
    'Santo Domingo Xenacoj',
    'Sumpango'
  ],
  'San Marcos': [
    'Ayutla',
    'Catarina',
    'Comitancillo',
    'Concepción Tutuapa',
    'El Quetzal',
    'El Rodeo',
    'El Tumbador',
    'Esquipulas Palo Gordo',
    'Ixchiguan',
    'La Reforma',
    'Malacatán',
    'Nuevo Progreso',
    'Ocos',
    'Pajapita',
    'Río Blanco',
    'San Antonio Sacatepéquez',
    'San Cristóbal Cucho',
    'San José Ojetenam',
    'San Lorenzo',
    'San Marcos',
    'San Miguel Ixtahuacán',
    'San Pablo',
    'San Pedro Sacatepéquez',
    'San Rafael Pie de La Cuesta',
    'San Sibinal',
    'Sipacapa',
    'Tacaná',
    'Tajumulco',
    'Tejutla'
  ],
  Jalapa: [
    'Jalapa',
    'Mataquescuintla',
    'Monjas',
    'San Carlos Alzatate',
    'San Luis Jilotepeque',
    'San Pedro Pinula',
    'San Manuel Chaparrón'
  ],
  'Santa Rosa': [
    'Barberena',
    'Casillas',
    'Chiquimulilla',
    'Cuilapa',
    'Guazacapán',
    'Nueva Santa Rosa',
    'Oratorio',
    'Pueblo Nuevo Viñas',
    'San Juan Tecuaco',
    'San Rafael Las Flores',
    'Santa Cruz Naranjo',
    'Santa María Ixhuatán',
    'Santa Rosa de Lima',
    'Taxisco'
  ],
  Sololá: [
    'Concepción',
    'Nahualá',
    'Panajachel',
    'San Andrés Semetabaj',
    'San Antonio Palopó',
    'San José Chacaya',
    'San Juan La Laguna',
    'San Lucas Tolimán',
    'San Marcos La Laguna',
    'San Pablo La Laguna',
    'San Pedro La Laguna',
    'Santa Catarina Ixtahuacan',
    'Santa Catarina Palopó',
    'Santa Clara La Laguna',
    'Santa Cruz La Laguna',
    'Santa Lucía Utatlán',
    'Santa María Visitación',
    'Santiago Atitlán',
    'Sololá'
  ],
  Suchitepéquez: [
    'Chicacao',
    'Cuyotenango',
    'Mazatenango',
    'Patulul',
    'Pueblo Nuevo',
    'Río Bravo',
    'Samayac',
    'San Antonio Suchitepéquez',
    'San Bernardino',
    'San Francisco Zapotitlán',
    'San Gabriel',
    'San José El Idolo',
    'San Juan Bautista',
    'San Lorenzo',
    'San Miguel Panán',
    'San Pablo Jocopilas',
    'Santa Bárbara',
    'Santo Domingo Suchitepequez',
    'Santo Tomas La Unión',
    'Zunilito'
  ],
  Totonicapán: [
    'Momostenango',
    'San Andrés Xecul',
    'San Bartolo',
    'San Cristóbal Totonicapán',
    'San Francisco El Alto',
    'Santa Lucía La Reforma',
    'Santa María Chiquimula',
    'Totonicapán'
  ],
  Zacapa: [
    'Cabañas',
    'Estanzuela',
    'Gualán',
    'Huité',
    'La Unión',
    'Río Hondo',
    'San Diego',
    'Teculután',
    'Usumatlán',
    'Zacapa'
  ]
}

export const DepartamentosGT: string[] = [
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Guatemala',
  'Huehuetenango',
  'Izabal',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Jalapa',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa'
]
