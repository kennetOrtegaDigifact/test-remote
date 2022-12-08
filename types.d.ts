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
    id?: string,
    numero?: number,
    nombre?: string,
    direccion?: string,
    municipio?: string,
    departamento?: string,
    codPostal?: string,
    pais?: string,
    estado?: string,
    granted?: boolean
    taxid?: string
    nProvincia?: string
    nDistrito?: string
    nCorregimiento?: string
    provincia?: string
    distrito?: string
    corregimiento?: string
    direccion?: string
    tipoSucursal?: string
    coordenadas?: string
    ne?: string
    numero?: string
    nombre?: string
    telefono?: string
}

export type InfoFiscalUser={
    nombre?: string,
    calle?: string,
    ciudad?: string,
    zona?: string,
    frases?: string,
    afiliacion?: string,
    postalEstablecimientos?: number,
    establecimientos?: Establecimiento[],
    dirEstablecimientos?: string,
    cm?: string,
    tipoPersoneria?: string,

    taxid?: string,

    razonSocial?: string,
    tipoContribuyent?: string,
    dv?: number,
    calle?: string,
    provincia?: string,
    distrito?: string,
    corregimiento?: string,
    codProvincia?: string,
    codDistrito?: string,
    codCorregimiento?: string
}

export type SharedData={
    taxid?: string
    name?: string,
    paquete?: string,
    creada?: Date,
    expira?: Date,
    estado?: string
    email?: string
    requestor?: string
    restantes?: string
}

export type PermisoPorAccion = {
    idActionRight: string|number,
    description: string,
    idRight: string|number,
    page: string,
    granted: boolean
}

export type PermisosPadre = {
    idRight?: number,
    description?: string,
    granted?: boolean,
    actions?: PermisoPorAccion[]
}

export type LogoPorEstablecimiento = {[key: number|string]: string}
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
    windowsInRealTime?: boolean,
    instaPrint?: boolean
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

export type PerfilFacturacionType = {
    RazonContingencia?: string
    Nombre: string
    NaturalezaOperacion: string
    TipoOperacion: string
    DestinoOperacion: string
    FormatoCAFE: string
    EntregaCAFE: string
    EnvioContenedor: string
    TipoVenta: string
    TipoSucursal: string
    InformacionInteres?: string
    FechaSalida: string
    TipoPago?: string
    PagoPredeterminado?: boolean
    MetodoPago?: {
        TiempoPago?: string
        TipoPago?: string
    }
    ProductsPredeterminados?: boolean
    ListaProductos?: Array<Producto>
}

export type User={
    taxid: string
    country: string
    userName: string
    requestor: string
    token: string
}

export interface userInterface {
    cleanTaxId?: string
    taxid?: string,
    country?: string,
    token?: string,
    userName?: string,
    // APIMSTOKEN?: string,
    requestor?: string,
    // tipoPersoneria?: string,
    establecimientos?: Establecimiento[],
    sharedData?: SharedData,
    infoFiscalUser?: InfoFiscalUser,
    configuracionApp?: ConfiguracionApp[],
    configuracionGeneral?: ConfiguracionGeneral,
    permisos?: any,
    usuarios?: Usuario[],
    clientes?: Cliente[],
    productos?: Producto[],
    MIPOS?: MIPOS
    decimales?: number
    logos?: Logos,
    urls?: {[key: string]: string},
    perfiles?: PerfilFacturacionType[]
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
        schema: Array<formulario>
        settings: UseFormProps
        observables?: string[]
        onBlurValues?: string[]
        resetButton?: {
            visible?: boolean
            text?: string
            style?: ViewStyle
            icon?: IconType
        }
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
    dateFrom?: string
    dateTo?: string
    establecimientos?: Establecimiento
    taxidReceptor?: string
    cancelled?: number
    documentType?: number
    numeroSerie?: string
    allDTESorUsername?: string
    amountFrom?: number
    amountTo?: number
    paymentType?: string
    limit?: number
    CUFE?: string
    signal?: AbortSignal
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
    cTaxId: string
    nombreContacto: string
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

export type ConsultasComponentSchema = {
    [key: string]: {
        labels: {
            searchLabel: string,
            [key: string]: string
        },
        searchKeys?: string[],
        functions: {
            print: (props: any) => Promise<any>
            fetchData: (props: any) => Promise<any>
            html: (props: any) => Promise<any>
            anular: (props: any) => Promise<any>
            pdf: (props: any) => Promise<any>
            sendCorreo: (props: any) => Promise<any>
            share: (props: any) => Promise<any>
        }
    }
}

type UnidadDeMedida = {
    label: string
    medida: string
    sistema: string
    nombre: string
    simbolo: string
    comentarios: string
}

export type Familia = {
    codFamilia: number
    nombreFamilia: string
}

export type Segmento = {
    codSegmento: number
    nombreSegmento: string
}

type CountryCodes = {
    countryName: string
    countryCode: string | number
}

export type Provincia={
    codProvincia?: string
    nombre?: string
}
export type Distrito={
    codDistrito?: string
    nombre?: string
}

export type Corregimiento={
    codCorregimiento?: string
    nombre?: string
}

export type Currencie={
    CC?: string
    CN?: string
}

export type IncoTerm={
    condicion?: string
    texto?: string
}
export interface UTILSDB {
    corregimientos?: Corregimiento[]
    distritos?: Distrito[]
    provincias?: Provincia[]
    countryCodes?: CountryCodes[]
    currencies?: Currencie[]
    incoterms?: IncoTerm[]
    familias?: Familia[]
    segmentos?: Segmento[]
    units?: UnidadDeMedida[]
    talonarioContingencia?: number[]
}

export type FELDocumentTypes={
    code: number|string
    name: string
    no: number|string
}

export type XmlProps={requestor?: string, taxid?: string, country?: string, userName?: string}

export interface Consultas {
    documentType?: string,
    clientTaxid?: string,
    clientName?: string,
    numeroSerie?: string,
    numeroDocumento?: string,
    fechaEmision?: string,
    monto?: string,
    paidTime?: string,
    cancelled?: string,
    establecimiento?: string,
    countryCode?: string,
    userCountryCode?: string,
    userTaxId?: string,
    razonSocial?: string,
    CUFE?: string,
    numeroAuth?: string,
    internalID?: string,
    userName?: string
}

type AdditionalIssueDocInfo={
    Name?: string
    Data?: string
    Value?: string
}

type TaxIDAdditionalInfo = AdditionalIssueDocInfo
type AdditionlInfo = AdditionalIssueDocInfo
type AdditionalBranchInfo=AdditionalIssueDocInfo
type Codes=AdditionalIssueDocInfo
type ContactNUC = {
    PhoneList?: {
        Phone?: string[]
    }
    EmailList?: {
        Email?: string[]
    }
    Website?: string
}
type AddressInfo = {
    Address?: string
    City?: string // POSTAL CODE IN GT
    District?: string // MUNICIPIO
    State?: string // DEPARTAMENTO
    Country?: string
}
type ThirdParties = {
    TaxID?: string
    TaxIDType?: string
    TaxIDAdditionalInfo?: TaxIDAdditionalInfo[]
}
type Tax={
    Code?: string
    Description?: string
    TaxableAmount?: number
    ChargableAmount?: number
    Rate?: number
    Amount?: number
}
type Totals={
    TotalBDiscount?: number
    TotalWDiscount?: number
    TotalBTaxes?: number
    TotalWTaxes?: number
    SpecificTotal?: number
    ExplicitTotal?: number
    TotalItem?: number
    InvoiceTotal?: number
}
type ItemNUC={
    Number?: string
    Codes?: Codes[]
    Type?: string
    Description?: string
    Qty?: number
    UnitOfMeasure?: string
    Price?: number
    Discounts?: number
    Taxes?: {
        Tax: Tax[]
    }
    Charges?: any
    Totals?: Totals
    AdditionalInfo?: AdditionlInfo[]
}

type Payments={
    Type?: string
    Code?: string
    Description?: string
    Date?: string
    Amount?: number
    AditionalData?: any
    nombreFormaPago?: string
}
type Info=AdditionlInfo
type AditionalData={
    Info?: Info[]
    Name?: string
    Id: number
}

type AdditionalInfoAdendas={
    Code?: string
    Type?: string
    Description?: string
    AddressInfo: AddressInfo
    Texts?: any
    AditionalData?: {
        Data?: AditionalData[]
    }
}
export interface NUC {
    Version: string
    CountryCode: string
    Header: {
        DocType?: string
        GUID?: string
        IssuedDateTime?: string
        AdditionalIssueType?: number
        ExchangeRate?: number
        Currency?: string
        Reference?: string
        AdditionalIssueDocInfo?: AdditionalIssueDocInfo[]
    }
    Seller: {
        TaxID?: string
        TaxIDType?: string
        TaxIDAdditionalInfo?: TaxIDAdditionalInfo[]
        Name?: string
        FiscalCategory?: string
        Contact?: ContactNUC
        AdditionlInfo?: AdditionlInfo[]
        AddressInfo?: string
        BranchInfo?: {
            Code?: string
            Name?: string
            AddressInfo?: AddressInfo
            Phone?: string
            AdditionalBranchInfo?: AdditionalBranchInfo[]
        }
    }
    Buyer: {
        TaxID?: string
        TaxIDType?: string
        TaxIDAdditionalInfo?: TaxIDAdditionalInfo[]
        Name?: string
        Contact?: ContactNUC
        AdditionlInfo?: AdditionlInfo[]
        AddressInfo?: AddressInfo
    }
    ThirdParties: ThirdParties[]
    Items: ItemNUC[]
    Charges?: any
    Totals: {
        QtyItems?: number
        TotalItems?: number
        TotalTaxableAmount?: number
        TotalTaxes?: number
        TotalCharges?: number
        TotalDiscounts?: number
        GrandTotal: Totals
        InWords?: string
    }
    Payments?: Payments[]
    AdditionalDocumentInfo: {
        DocTemplate?: any
        AdditionalInfo?: AdditionalInfoAdendas
        AditionalInfo?: AdditionlInfo[]
    }
}
