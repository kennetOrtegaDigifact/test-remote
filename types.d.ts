import { KeyboardType, TextStyle, ViewStyle } from 'react-native'
import { RegisterOptions, FieldValues, FieldPath } from 'react-hook-form'

export interface IconType {
    name: string,
    size: number,
    color: string,
    type: 'm' | 'a' | 'i' | 'v'
}

export type AppCodes = {
  dataVacio: number
  ok: number
  processError: number
  invalidData: number
  unauthorized: number
}

export type Branch = {
    numero: number | string
}

export type Establecimiento={
    id: string,
    numero: number,
    nombre: string,
    direccion: string,
    municipio: string,
    departamento: string,
    codPostal: string,
    pais: string,
    estado: string,
    granted?: boolean
    nit?: string | number
}

export type InfoFiscalUser={
    nombre: string,
    calle: string,
    ciudad: string,
    zona: string,
    frases: string,
    afiliacion: string,
    postalEstablecimientos: number,
    establecimientos: Establecimiento[],
    dirEstablecimientos: string,
    cm: string,
    tipoPersoneria: string,
    nit: string
}

export type SharedData={
    nombre: string,
    paquete: string,
    creada: Date,
    expira: Date,
    estado: string
}

export type PermisosPadre = {
    idRight: number,
    description: string,
    granted: boolean,
    actions?: PermisoPorAccion[]
}

export type PermisoPorAccion = {
    idActionRight: string|number,
    description: string,
    idRight: string|number,
    page: string,
    granted: boolean
}

export type LogoPorEstablecimiento = Array<{[key: number|string]: string}>
export type Logos={
    logoGeneral: string,
    logoPorEstablecimiento: LogoPorEstablecimiento
}

export type ConfiguracionApp={
    nit?: string|number,
    valor?: string|number,
    tipoOperacion?: string,
    idTipoConfiguracion?: string|number,
    tipoConfiguracion?: string|number
}

export type ConfiguracionGeneral={
    actionsInRealTime?: boolean,
    windowsInRealTime?: boolean
}

export type MIPOS={
    apiToken?: string,
    token?: string,
    userToken?: string
}

export type Usuario = {
    taxid: string,
    country: string,
    userName: string,
    firstNames?: string,
    lastNames?: string,
    nombre: string,
    email?: string,
    telefono?: string,
    GR?: string,
}

export type Cliente={
    id: string|number,
    country: string,
    sTaxId: string|number,
    tipoCliente: string,
    NIT: string|number,
    nombreOrganizacion: string,
    nombreContacto: string,
    cargo: string,
    telefono: string,
    correo: string,
    IDBitacoraCustomer: string | number,
    estado: string,
    fechaCreacion: Date,
    observaciones: string,
    direccion: string,
    municipio: string,
    departamento: string,
    pais?: string,
    nit?: string,
    name?: string,
}

export type User={
    taxid: string
    country: string
    userName: string
    requestor: string
    token: string
}

export interface userInterface {
    taxid: string,
    country: string,
    token: string,
    userName: string,
    APIMSTOKEN: string,
    requestor: string,
    tipoPersoneria?: string,
    establecimientos?: Establecimiento[],
    sharedData: SharedData,
    infoFiscalUser: InfoFiscalUser,
    configuracionApp?: ConfiguracionApp[],
    configuracionGeneral?: ConfiguracionGeneral,
    permisos?: any,
    usuarios?: Usuario[],
    clientes?: Cliente[],
    MIPOS?: MIPOS
}

export type formulario = {
    type: 'inputText' | 'picker' | 'dateTime',
    name: string,
    placeholder?: string,
    keyboardType?: KeyboardType,
    disabled?: boolean,
    secureTextEntry?: boolean,
    switchIcon?: IconType,
    picker?: {
        data: Array<any>,
        labelKey: string,
        valueKey: string,
        defaultValue: string,
        withSearch?: boolean,
        searchlabel?: string,
        onChange?: (value: any) => void,
        labelStyle?: TextStyle,
        style?: ViewStyle
    },
    icon?: IconType,
    rules?: Omit<RegisterOptions<FieldValues, FieldPath<FieldValues>>, 'valueAsNumber'|'valueAsDate'|'setValueAs'|'disabled'>,
    style?: ViewStyle
}

export type countriesDictionaryType ={
    name_en: string,
    name_es: string,
    dial_code: string,
    code: string
}

export type ProductoResumen={
    descripcion: string
    cantidad: number | string
    total: number | string
    iva: number | string
    idp: number | string
    idt: number | string
    tml: number | string
    itp: number | string
    ibv: number | string
    tabaco: number | string
}

export type Filter={
    fechaInicio?: string
    fechaFin?: string
    establecimientos?: Establecimiento
    nitReceptor?: string
    porAnulados?: { value: number | string }
    tipoDocumento?: {no?: number|string}
    numeroSerie?: string
    allDTESorUsername?: string
    amountFrom?: number
    amountTo?: number
    paymentType?: string
    limit?: number
}

export type Invoice = {
    Autorizacion: string | number
    Serie: string|number
    NUMERO: number|string
    Fecha_de_certificacion: string | Date
}

export type NitService = {
    country: string
    departamento: string
    municipio: string
    direccion: string
    nombre: string
    taxid: string
}

export type Product = {
    name: string,
    price: number,
    eanprod: number | string,
    type: string,
    unit: string,
    quantity?: number,
    discount?: number
}

export type DocumentTypes = {
    XML: string
    PDF: string
    HTML: string
}

export type ConsultaDTE = {
    documentType: string
    countryCode: string
    clientTaxid: string
    clientName: string
    userCountryCode: string
    userTaxId: string
    razonSocial: string
    numeroSerie: string
    numeroDocumento: string
    establecimiento: string
    fechaEmision: string
    monto: string
    paidTime: string
    cancelled: string
    numeroAuth: string
    internalID: string
    userName: string
}

export type NIT={
    country: string
    taxid: string
    nombre: string
    direccion: string
    departamento: string
    municipio: string
}
