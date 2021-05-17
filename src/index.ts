import { name, version } from '../package.json'

class WebStorage {
  private static mark: string = name
  private static readonly version: string = version
  private static readonly type: Array<any> = [
    Array,
    Object,
    Boolean,
    Number,
    String,
    Map,
    Set,
    void 0,
  ]

  public static setMark(mark: string) {
    WebStorage.mark = mark
  }

  private storage: Storage
  private keyName: string
  private valueType: any

  public constructor(storage: Storage, keyName: string, valueType: any) {
    this.storage = storage
    this.keyName = valueType ? keyName : WebStorage.mark + '$' + keyName
    if (!WebStorage.type.includes(valueType)) {
      throw new Error('unknown type')
    }
    this.valueType = valueType
  }

  private serialize(value: any, type: any): string {
    switch (type) {
      case void 0:
        return JSON.stringify({ src: value, version: WebStorage.version })
      case Map:
      case Set:
        value = Array.from(value)
      case Array:
      case Object:
        return JSON.stringify(value)
      case Boolean:
      case Number:
      case String:
      default:
        return '' + value
    }
  }

  private unserialize(value: string, type: any): any {
    switch (type) {
      case void 0:
        try {
          const pack = JSON.parse(value)
          return pack.src
        } catch (error) {
          console.error(error)
          this.removeItem()
          return null
        }
      case Map:
        return new Map(JSON.parse(value))
      case Set:
        return new Set(JSON.parse(value))
      case Array:
      case Object:
        return JSON.parse(value)
      case Boolean:
        return value === 'true'
      case Number:
        return +value
      case String:
      default:
        return value
    }
  }

  public getItem(): any {
    const value = this.storage.getItem(this.keyName)
    return value === null ? null : this.unserialize(value, this.valueType)
  }

  public setItem(value: any): void {
    this.storage.setItem(this.keyName, this.serialize(value, this.valueType))
  }

  public removeItem(): void {
    this.storage.removeItem(this.keyName)
  }

  public clear(): void {
    this.storage.clear()
  }

  public key(key: number): string | null {
    let value = this.storage.key(key)
    if (value) {
      try {
        const pack = JSON.parse(value)
        value = pack.src
      } catch (error) {
        console.error(error)
        this.removeItem()
        value = null
      }
    }
    return value
  }

  public get length(): number {
    return this.storage.length
  }

  public set lenght(_: number) {
    throw new Error('readonly')
  }

  public all(): { [key: string]: string } {
    return { ...this.storage }
  }

  public getStorage(): Storage {
    return this.storage
  }

  public getKeyName(): string {
    return this.keyName
  }

  public getValueType(): any {
    return this.valueType
  }
}

export default WebStorage
