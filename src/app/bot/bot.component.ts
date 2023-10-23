import { Component, OnInit } from '@angular/core';


const SELECTED_USER_CLASSNAME = '--selectedby-user';
const PREDICTED_SELECTED_CLASSNAME = '--bot-selected'
const DASHES_CLASSNAME = "--dashes"
const DARK_CLASSNAME = '--dark'

const RESERVED_CLASSNAMES = [
  SELECTED_USER_CLASSNAME,
  PREDICTED_SELECTED_CLASSNAME,
  DASHES_CLASSNAME,
  DARK_CLASSNAME
]

const CLICK = 'click' as const
const INPUT = 'input' as const
const IGNORE = 'ignore-inspector'

type Subaction = typeof CLICK | typeof INPUT

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnInit {


  steps: 1 | 2 | 3 = 1

  subactions: Subaction | '' = ''

  inputValue = ''

  enableInspector = true

  showOverlay = false

  x = 0
  y = 0
  width = 0
  height = 0

  ngOnInit(): void {
    this.toggle()
  }

  mainselectedElement: Element[] = []

  subselectedElement: Element[] = []


  get isClickedSubAction() {
    return this.subactions === CLICK
  }

  get isInputSubActions() {
    return this.subactions === INPUT
  }

  get predictionParentCounter() {
    return this.mainselectedElement.length - 2
  }

  get elements() {
    return this.subactions ? this.subselectedElement : this.mainselectedElement;
  }

  get sizeStyle() {
    return {
      left: `${this.x}px`,
      top: `${this.y}px`,
      width: `${this.width}px`,
      height: `${this.height}px`
    }
  }

  get allSelectedClasses() {
    return [...new Set(this.elements.map((e) => e.className.split(' ')).flat())]
      .filter((className) => !RESERVED_CLASSNAMES.includes(className))
      .filter((className) => {
        return this.elements.every((el) => {
          return el.className.includes(className)
        })
      })
  }

  get selectedHtmlTagNames() {
    return [...new Set(this.elements.map((el) => el.tagName))]
  }

  toggle() {
    const listener = document.addEventListener
    listener?.call(document.body, 'mousemove', (e) => this.updateMousePosition(e))
    listener?.call(document.body, 'click', (e) => this.handleClick(e), true)
  }

  getTargetNode(e: Event) {
    const path = e.composedPath() as HTMLElement[]
    if (!path) null
    const isBot = path.some((node) => node.hasAttribute?.(IGNORE))
    if (isBot) return null
    const [targetNode] = path
    return targetNode
  }

  handleClick(e: Event) {
    const targetNode = this.getTargetNode(e)
    if (!targetNode || !this.enableInspector) return
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    this.selectHtmlElements(e.target as Element)

  }

  updateMousePosition(e: Event) {
    const targetNode = this.getTargetNode(e)
    if (targetNode) {
      this.showOverlay = true
      const rect = targetNode.getBoundingClientRect()
      this.x = rect.x
      this.y = rect.y
      this.width = rect.width
      this.height = rect.height
    } else {
      this.showOverlay = false
    }

  }

  onChoosingSubAction(subactions: Subaction) {
    this.subactions = subactions
    this.steps = 3
    this.mainselectedElement.forEach((e) => e.classList.add(DASHES_CLASSNAME))
  }

  reset() {
    if (!this.subactions) {
      this.steps = 1;
      this.mainselectedElement.forEach((el) => this.clearSelectedClasses(el))
      this.mainselectedElement = []
    } else {
      this.steps = 2
      this.subselectedElement.forEach((el) => this.clearSelectedClasses(el))
      this.subselectedElement = []
      this.subactions = ''
      this.inputValue = ''
    }
  }

  clearSelectedClasses(e: Element) {
    e.classList.remove(DARK_CLASSNAME)
    e.classList.remove(DASHES_CLASSNAME)
    e.classList.remove(SELECTED_USER_CLASSNAME)
    e.classList.remove(PREDICTED_SELECTED_CLASSNAME)
  }

  isSubElement(e: Element) {
    return this.mainselectedElement.some((el) => {
      return Array.from(el.childNodes).some((child) => child === e)
    })
  }

  selectHtmlElements(element: Element, userSelected = true) {

    //deselect selection
    if (this.steps === 2) return

    const index = this.elements.findIndex((el) => el === element)
    if (index !== -1) { //deselect an element if its already selected
      this.elements.splice(index, 1)
      this.clearSelectedClasses(element)
      return
    }

    const selectedSubElement = this.elements.filter((el) => {
      return Array.from(element.childNodes).some((child) => child === el)
    })

    selectedSubElement.forEach((el) => {
      this.clearSelectedClasses(el)
      const index = this.elements.findIndex((e) => e === el)
      //deselects the child element if parent is selected

      if (index !== -1) this.elements.splice(index, 1)
    })

    //select element

    this.elements.push(element)


    // add classname for the styles

    if (userSelected) element.classList.add(SELECTED_USER_CLASSNAME)
    else element.classList.add(PREDICTED_SELECTED_CLASSNAME)

    if (this.subactions) element.classList.add(DARK_CLASSNAME)

    const shouldBePredicted = (this.subactions && this.elements.length) || this.elements.length > 1


    if (shouldBePredicted && userSelected) this.prediction()

  }


  predictByClassName() {

    if (!this.allSelectedClasses.length) return []
    const same = document.body.querySelectorAll(
      this.allSelectedClasses.map((c) => `.${c}`).join('')
    )

    if (same.length <= this.elements.length) return []
    return Array.from(same).map((el) => {
      if (this.elements.find((e) => e === el)) return
      if (this.subactions && !this.isSubElement(el)) return
      return el
    }).filter(Boolean) as Element[]

  }

  predictByTagName() {

    if (this.selectedHtmlTagNames.length !== 1) return []
    const same = document.body.getElementsByTagName(
      this.selectedHtmlTagNames[0]
    )

    if (same.length <= this.elements.length) return []
    return Array.from(same).map((el) => {
      if (this.elements.find((e) => e === el)) return
      if (this.subactions && !this.isSubElement(el)) return
      return el
    })
      .filter(Boolean) as Element[]

  }

  prediction() {
    const predictByClassName = this.predictByClassName()
    if (predictByClassName.length) {
      predictByClassName.forEach((el) => this.selectHtmlElements(el, false))
      return
    }

    const predictByTagName = this.predictByTagName()
    if (predictByTagName.length) {
      predictByTagName.forEach((el) => this.selectHtmlElements(el, false))
      return
    }
  }


  async markAllTasksAsDone() {
    this.enableInspector = false;

    //  find all checkboxes and mark them as checked
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = true;
      // Dispatch a change event to trigger any associated event listeners
      const changeEvent = new Event('change', { bubbles: true });
      checkbox.dispatchEvent(changeEvent);
    });

    this.enableInspector = true;
  }





  async runBot() {
    this.enableInspector = false
    await Promise.all(

      this.subselectedElement.map((el) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (this.subactions === 'click') (el as HTMLButtonElement).click()
            if (this.subactions === 'input') (el as HTMLInputElement).value = this.inputValue
            resolve(null)
          }, 100)
        })
      })

    )

    await this.markAllTasksAsDone()

    this.enableInspector = true
  }


}
