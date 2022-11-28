import { KeyboardType, TextStyle, ViewStyle } from 'react-native'
import { RegisterOptions, FieldValues, FieldPath, UseFormProps } from 'react-hook-form'
import { ObjectSchema } from 'yup'
import { ObjectShape, TypeOfShape } from 'yup/lib/object'
import { AnyObject } from 'yup/lib/types'

export interface IconType {
    name?: string,
    size?: number,
    color?: string,
    type?: 'm' | 'a' | 'i' | 'v'
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

export type PermisoPorAccion = {
    idActionRight: string|number,
    description: string,
    idRight: string|number,
    page: string,
    granted: boolean
}

export type PermisosPadre = {
    idRight: number,
    description: string,
    granted: boolean,
    actions?: PermisoPorAccion[]
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
    cTaxId?: string
    DV?: string
    tipoCliente?: string
    tipoContribuyente?: string
    nombreOrga?: string
    nombreContacto?: string
    countryCode?: string
    country?: string
    cargo?: string
    telefono?: string
    correo?: string
    direccion?: string
    provincia?: string
    distrito?: string
    corregimiento?: string
    IDBitacoraCustomer?: number | string
    NIT?: number | string
    departamento?: string
    estado?: string
    fechaCreacion?: string
    id?: number | string
    municipio?: string
    observaciones?: string
    sTaxId?: number | string
}

type OTI={
    Codigo: string
    Tasa: number
    Valor: number
}
type Impuestos = {
    ISC?: {
        Tasa?: number
        Valor?: number
    },
    ITBMS?: string | number
    OTI?: OTI[]
}

export interface Producto {
    country?: string
    taxid?: string | number
    name?: string
    price?: number
    unit?: string
    impuestos?: Impuestos
    ean?: string
    segmento?: number
    familia?: number
    quantity?: number
    discount?: number
    tipo?: string
    selected?: boolean
}

export type User={
    taxid: string
    country: string
    userName: string
    requestor: string
    token: string
}

export interface userInterface {
    code: number
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
    productos?: Producto[],
    MIPOS?: MIPOS
    talonarioContingencia: {[key: string]: string|number}
    decimales: number
    logos: Logos,
    urls: {[key: string]: string}
}

export type formulario = {
    type: 'inputText' | 'picker' | 'dateTime' | 'switch' | 'accionable' | 'selectProduct',
    label?: string,
    labelStyle?: TextStyle,
    name: string,
    placeholder?: string,
    keyboardType?: KeyboardType,
    disabled?: boolean,
    secureTextEntry?: boolean,
    switchIcon?: IconType,
    switchForm?: Array<formulario>
    required?: boolean,
    list?: Array<any>
    onBlur?: (values?: any) => void
    picker?: {
        data?: Array<any>,
        labelKey?: string,
        valueKey?: string,
        defaultValue: string,
        withSearch?: boolean,
        searchlabel?: string,
        onChange?: (value: any) => void,
        labelStyle?: TextStyle,
        style?: ViewStyle,
        arrowIcon?: IconType
    },
    icon?: IconType,
    rules?: Omit<RegisterOptions<FieldValues, FieldPath<FieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>,
    style?: ViewStyle
}

export type FormularioPerCountry = {
    [key: string]: {
        schema: Array<formulario>,
        settings: UseFormProps
    }
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

export type DashboardType={
    resumenMensual: any[]
    ingresoAnual: number
    nuevosClientes: number
    ingresoMensual: number
    numeroVentas: number
    ventasAnteriores: number
    totalCs: number
    csAnteriores: number
    totalClientes: number
    promedioVentaPorFactura: number
    resumenSemanal: number[]
    resumenAnual: {[key: string|number]: number[]}
    topClientes: [{[key:string]: string|number, [key:string]:number}] | any[]
}

export type DinamycConsultasServiceHook={
    buscarPlaceHolder?: string
    anular?: {
        [key: string]: (values: any) => void
    }
    reimprimir?: {
        [key: string]: void
    }
    visualizarPdf?: {
        [key: string]: void
    }
    compartir?: {
        [key: string]: void
    }
    visualizarHtml?: {
        [key: string]: void
    }
}

export type ValidatorSchema = {
    [key: string]: (props?: any) => ObjectSchema<ObjectShape, AnyObject, TypeOfShape<ObjectShape>>
}

export type ServiceFetchProps = {
  [key: string]: {
    keys: string[],
    props: {
      [key: string]: string
    }
  }
}

export type ComponentSchema = {
    [key: string]: {
        labels: {
            searchLabel: string,
            [key: string]: string
        },
        searchKeys?: string[],
        functions: {
            borrar: (props: any) => Promise<any>
            fetchData: (props: any) => Promise<any>
            addEdit: (props: any) => Promise<any>
        }
    }
}
