import {
  ColorValue, EventObject, PropertyChangedEvent, TextInput, TextInputAcceptEvent, TextInputInputEvent,
  TextInputSelectEvent, Properties, FontValue, TextInputBeforeTextChangeEvent
} from 'tabris';

let widget: TextInput = new TextInput({type: 'password'});

// Properties
let alignment: 'centerX' | 'left' | 'right';
let autoCapitalize: true | false | 'none' | 'sentence' | 'word' | 'all';
let autoCorrect: boolean;
let borderColor: ColorValue;
let editable: boolean;
let cursorColor: ColorValue;
let floatMessage: boolean;
let focused: boolean;
let keepFocus: boolean;
let keyboard: 'ascii' | 'decimal' | 'default' | 'email' | 'number' | 'numbersAndPunctuation' | 'phone' | 'url';
let enterKeyType: 'default' | 'done' | 'next' | 'send' | 'search' | 'go';
let message: string;
let text: string;
let textColor: ColorValue;
let textInputType: 'default' | 'multiline' | 'password' | 'search';
let selection: number[];
let keyboardAppearanceMode: 'never' | 'ontouch' | 'onfocus';
let style: 'default' | 'outline' | 'fill' | 'underline' | 'none';
let font: FontValue;
let maxChars: number;
let messageColor: ColorValue;

alignment = widget.alignment;
autoCapitalize = widget.autoCapitalize;
autoCorrect = widget.autoCorrect;
borderColor = widget.borderColor;
editable = widget.editable;
cursorColor = widget.cursorColor;
floatMessage = widget.floatMessage;
focused = widget.focused;
keepFocus = widget.keepFocus;
keyboard = widget.keyboard;
enterKeyType = widget.enterKeyType;
message = widget.message;
text = widget.text;
textColor = widget.textColor;
textInputType = widget.type;
selection = widget.selection;
keyboardAppearanceMode = widget.keyboardAppearanceMode;
style = widget.style;
font = widget.font;
maxChars = widget.maxChars;
messageColor = widget.messageColor;

widget.alignment = alignment;
widget.autoCapitalize = autoCapitalize;
widget.autoCorrect = autoCorrect;
widget.borderColor = borderColor;
widget.editable = editable;
widget.cursorColor = cursorColor;
widget.floatMessage = floatMessage;
widget.focused = focused;
widget.keepFocus = keepFocus;
widget.keyboard = keyboard;
widget.enterKeyType = enterKeyType;
widget.message = message;
widget.text = text;
widget.textColor = textColor;
widget.selection = selection;
widget.keyboardAppearanceMode = keyboardAppearanceMode;
widget.style = style;
widget.font = font;
widget.maxChars = maxChars;
widget.messageColor = messageColor;

let properties: Properties<TextInput> = {
  alignment,
  autoCapitalize,
  autoCorrect,
  borderColor,
  editable,
  cursorColor,
  floatMessage,
  focused,
  keepFocus,
  keyboard,
  enterKeyType,
  message,
  text,
  textColor,
  keyboardAppearanceMode,
  selection,
  style: style,
  type: textInputType
};
widget = new TextInput(properties);
widget.set(properties);

// Events
let target: TextInput = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let newValue: string = 'foo';
let oldValue: string = 'foo';
let textValue: string = 'bar';
let selectionValue: number[] = [1, 2];

let acceptEvent: TextInputAcceptEvent = {target, timeStamp, type, text};
let blurEvent: EventObject<TextInput> = {target, timeStamp, type};
let focusEvent: EventObject<TextInput> = {target, timeStamp, type};
let inputEvent: TextInputInputEvent = {target, timeStamp, type, text};
let textChangedEvent: PropertyChangedEvent<TextInput, string> = {target, timeStamp, type, value: textValue};
let selectEvent: TextInputSelectEvent = {target, timeStamp, type, selection};
let selectionChangedEvent: PropertyChangedEvent<TextInput, number[]> = {target, timeStamp, type, value: selectionValue};
let beforeTextChangeEvent: TextInputBeforeTextChangeEvent<TextInput> = {target, timeStamp, type, newValue, oldValue, preventDefault() {}};

widget
  .onAccept((event: TextInputAcceptEvent) => {})
  .onBlur((event: EventObject<TextInput>) => {})
  .onFocus((event: EventObject<TextInput>) => {})
  .onInput((event: TextInputInputEvent) => {})
  .onSelect((event: TextInputSelectEvent) => {})
  .onTextChanged((event: PropertyChangedEvent<TextInput, string>) => {})
  .onBeforeTextChange((event: TextInputBeforeTextChangeEvent<TextInput>) => {})
  .onSelectionChanged((event: PropertyChangedEvent<TextInput, number[]>) => {});

class CustomComponent extends TextInput {
  public foo: string;
  constructor(props: Properties<TextInput> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
