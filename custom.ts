keymap.setSystemKeys(0, 0, 0, 0)

//% icon="\u2328"
//% color="#9c1355"
//% block="KeyEvents"
namespace keyEvents {
    export enum Event {
        //% block="pointer down"
        PointerDown = 6857,
        //% block="pointer up"
        PointerUp = 6858,
        //% block="pointer move"
        PointerMove = 6859,
        //% block="pointer leave"
        PointerLeave = 6860,
        //% block="pointer enter"
        PointerEnter = 6861,
        //% block="pointer cancel"
        PointerCancel = 6862,
        //% block="pointer over"
        PointerOver = 6863,
        //% block="pointer out"
        PointerOut = 6864,
        //% block="wheel"
        Wheel = 6865,
        //% block="key down"
        KeyDown = 6866,
        //% block="key up"
        KeyUp = 6867
    }

    export class _SceneButtonHandlers<U> {
        protected handlers: ButtonHandler<U>[];

        constructor(public id: number, protected invokeHandler: (handler: U) => void) {
            this.handlers = [];
        }

        onEvent(event: number, handler: U) {
            this.getHandler(event, true).handler = handler;
        }

        addEventListener(event: number, handler: U) {
            this.getHandler(event, true).listeners.push(handler);
        }

        removeEventListener(event: number, handler: U) {
            const eventHandler = this.getHandler(event);

            if (eventHandler) {
                eventHandler.listeners = eventHandler.listeners.filter(h => h !== handler);
            }
        }

        protected getHandler(event: number, createIfMissing?: boolean) {
            for (const handler of this.handlers) {
                if (handler.event === event) return handler;
            }

            if (createIfMissing) {
                const newHandler = new ButtonHandler<U>(event, this.id, this.invokeHandler);
                this.handlers.push(newHandler);
                return newHandler;
            }

            return undefined;
        }
    }

    class ButtonHandler<U> {
        handler: U;
        listeners: U[] = [];

        constructor(public readonly event: number, id: number, invokeHandler: (handler: U) => void) {
            control.onEvent(event, id, () => {
                if (this.handler) {
                    invokeHandler(this.handler);
                }
                for (const listener of this.listeners) {
                    invokeHandler(listener);
                }
            });
        }
    }

    export enum Key {
        Zero = 48,
        One = 49,
        Two = 50,
        Three = 51,
        Four = 52,
        Five = 53,
        Six = 54,
        Seven = 55,
        Eight = 56,
        Nine = 57,
        Hyphen = 189,
        Q = 81,
        W = 87,
        E = 69,
        R = 82,
        T = 84,
        Y = 89,
        U = 85,
        I = 73,
        O = 79,
        P = 80,
        A = 65,
        S = 83,
        D = 68,
        F = 70,
        G = 71,
        H = 72,
        J = 74,
        K = 75,
        L = 76,
        Z = 90,
        X = 88,
        C = 67,
        V = 86,
        B = 66,
        N = 78,
        M = 77,
        Comma = 188,
        Period = 190,
        BackSpace = 8,
        Shift = 16,
        Enter = 13,
        Tab = 9,
    }

    export enum KeyEvent {
        //% block="pressed"
        Pressed = 6872,
        //% block="released"
        Released = 6873,
        //% block="repeat"
        Repeat = 6874
    }

    //% whenUsed
    const INTERNAL_KEY_DOWN = 6870;
    //% whenUsed
    const INTERNAL_KEY_UP = 6871;

    export function keyToString(key: Key) {
        switch (key) {
            case Key.Q:
                return "Q";
            case Key.W:
                return "W";
            case Key.E:
                return "E";
            case Key.R:
                return "R";
            case Key.T:
                return "T";
            case Key.Y:
                return "Y";
            case Key.U:
                return "U";
            case Key.I:
                return "I";
            case Key.O:
                return "O";
            case Key.P:
                return "P";
            case Key.A:
                return "A";
            case Key.S:
                return "S";
            case Key.D:
                return "D";
            case Key.F:
                return "F";
            case Key.G:
                return "G";
            case Key.H:
                return "H";
            case Key.J:
                return "J";
            case Key.K:
                return "K";
            case Key.L:
                return "L";
            case Key.Z:
                return "Z";
            case Key.X:
                return "X";
            case Key.C:
                return "C";
            case Key.V:
                return "V";
            case Key.B:
                return "B";
            case Key.N:
                return "N";
            case Key.M:
                return "M";
            case Key.Comma:
                return ",";
            case Key.Period:
                return ".";
            case Key.Shift:
                return "Shift";
            case Key.Enter:
                return "Enter";
            case Key.Tab:
                return "Tab";
            case Key.Zero:
                return "0";
            case Key.One:
                return "1";
            case Key.Two:
                return "2";
            case Key.Three:
                return "3";
            case Key.Four:
                return "4";
            case Key.Five:
                return "5";
            case Key.Six:
                return "6";
            case Key.Seven:
                return "7";
            case Key.Eight:
                return "8";
            case Key.Nine:
                return "9";
            case Key.Hyphen:
                return "-";
            case Key.BackSpace:
                return "BackSpace";
        }
    }

    //% whenUsed
    let _buttonsPendingInit: KeyButton[];

    let defaultRepeatDelay = 500;
    let defaultRepeatInterval = 30;
    let _lastKeyPressed: Key = 0;

    type KeyHandler = () => void;
    type KeyCodeHandler = (key: Key) => void;

    //% fixedInstances
    export class KeyButton {
        protected _pressed: boolean;
        public repeatDelay: number;
        public repeatInterval: number;
        private _repeatCount: number;
        private _pressedElapsed: number;

        protected sceneStack: _SceneButtonHandlers<KeyHandler>[];
        protected sceneStackWithKey: _SceneButtonHandlers<KeyCodeHandler>[];

        protected get state(): _SceneButtonHandlers<KeyHandler> {
            return this.sceneStack[this.sceneStack.length - 1];
        }

        protected get stateWithKey(): _SceneButtonHandlers<KeyCodeHandler> {
            return this.sceneStackWithKey[this.sceneStackWithKey.length - 1];
        }

        constructor(public id: number) {
            // use internalOnEvent so that events fire regardless of the current scene
            control.internalOnEvent(INTERNAL_KEY_UP, this.id, () => this.setPressed(false), 16);
            control.internalOnEvent(INTERNAL_KEY_DOWN, this.id, () => this.setPressed(true), 16);
            this._pressed = false;

            // this code may run before game/scene.ts, in which case calling this.__registerUpdate
            // will trigger an exception. to prevent that, start a thread that pauses until we
            // detect that an event context has been registered and then call it
            if (control.eventContext()) {
                this.__registerUpdate();
            }
            else {
                if (!_buttonsPendingInit) {
                    _buttonsPendingInit = [];
                    control.runInBackground(() => {
                        pauseUntil(() => !!control.eventContext());
                        for (const button of _buttonsPendingInit) {
                            button.__registerUpdate();
                        }
                        _buttonsPendingInit = undefined;
                    });
                }
                _buttonsPendingInit.push(this);
            }

            this.sceneStack = [new _SceneButtonHandlers<KeyHandler>(id, invokeKeyHandler)];
            this.sceneStackWithKey = [new _SceneButtonHandlers<KeyCodeHandler>(id, (handler: KeyCodeHandler) => invokeKeyHandlerWithCode(handler, this.id))];

            game.addScenePushHandler(() => {
                this.sceneStack.push(new _SceneButtonHandlers<KeyHandler>(id, invokeKeyHandler));
                this.sceneStackWithKey.push(new _SceneButtonHandlers<KeyCodeHandler>(id, (handler: KeyCodeHandler) => invokeKeyHandlerWithCode(handler, this.id)));
                this.__registerUpdate();
            });
            game.addScenePopHandler(() => {
                this.sceneStack.pop();
                this.sceneStackWithKey.pop();
                if (this.sceneStack.length === 0) {
                    this.sceneStack = [new _SceneButtonHandlers<KeyHandler>(id, invokeKeyHandler)];
                    this.sceneStackWithKey = [new _SceneButtonHandlers<KeyCodeHandler>(id, (handler: KeyCodeHandler) => invokeKeyHandlerWithCode(handler, this.id))];
                    this.__registerUpdate();
                }
            });
        }

        setPressed(pressed: boolean) {
            if (this._pressed === pressed) return;

            this._pressed = pressed;
            if (pressed) {
                _lastKeyPressed = this.id as Key;
                this._repeatCount = 0;
                this._pressedElapsed = 0;
                control.raiseEvent(KeyEvent.Pressed, this.id);
            }
            else {
                control.raiseEvent(KeyEvent.Released, this.id);
            }
        }

        //% blockId=browserEvents_key_onEvent
        //% block="on $this key $event"
        //% group="Keyboard"
        //% weight=100
        onEvent(event: KeyEvent, handler: () => void) {
            this.state.onEvent(event, handler);
        }

        onEventWithKey(event: KeyEvent, handler: (key: Key) => void) {
            this.stateWithKey.onEvent(event, handler);
        }

        //% blockId=browserEvents_key_isPressed
        //% block="is $this key pressed"
        //% group="Keyboard"
        //% weight=90
        isPressed() {
            return this._pressed;
        }

        //% blockId=browserEvents_key_pauseUntil
        //% block="pause until $this key is $event"
        //% group="Keyboard"
        //% weight=80
        pauseUntil(event: KeyEvent) {
            control.waitForEvent(event, this.id)
        }

        addEventListener(event: KeyEvent, handler: () => void) {
            this.state.addEventListener(event, handler);
        }

        addEventListenerWithKey(event: KeyEvent, handler: (key: Key) => void) {
            this.stateWithKey.addEventListener(event, handler);
        }

        removeEventListener(event: KeyEvent, handler: () => void) {
            this.state.removeEventListener(event, handler);
        }

        removeEventListenerWithKey(event: KeyEvent, handler: (key: Key) => void) {
            this.stateWithKey.removeEventListener(event, handler);
        }

        __update() {
            const delay = this.repeatDelay === undefined ? defaultRepeatDelay : this.repeatDelay;
            const interval = this.repeatInterval === undefined ? defaultRepeatInterval : this.repeatInterval;
            if (!this._pressed) return;
            this._pressedElapsed += game.eventContext().deltaTimeMillis;

            // inital delay
            if (this._pressedElapsed < delay)
                return;

            // repeat count for this step
            const count = Math.floor((this._pressedElapsed - delay - interval) / interval);
            if (count != this._repeatCount) {
                this._repeatCount = count;
                control.raiseEvent(KeyEvent.Repeat, this.id);
            }
        }

        __registerUpdate() {
            game.eventContext().registerFrameHandler(scene.CONTROLLER_PRIORITY, () => this.__update());
        }
    }

    function invokeKeyHandler(handler: KeyHandler) {
        handler();
    }

    function invokeKeyHandlerWithCode(handler: KeyCodeHandler, keyCode: number) {
        handler(keyCode as Key);
    }

    //% fixedInstance whenUsed
    export const A = new KeyButton(Key.A);

    //% fixedInstance whenUsed
    export const B = new KeyButton(Key.B);

    //% fixedInstance whenUsed
    export const C = new KeyButton(Key.C);

    //% fixedInstance whenUsed
    export const D = new KeyButton(Key.D);

    //% fixedInstance whenUsed
    export const E = new KeyButton(Key.E);

    //% fixedInstance whenUsed
    export const F = new KeyButton(Key.F);

    //% fixedInstance whenUsed
    export const G = new KeyButton(Key.G);

    //% fixedInstance whenUsed
    export const H = new KeyButton(Key.H);

    //% fixedInstance whenUsed
    export const I = new KeyButton(Key.I);

    //% fixedInstance whenUsed
    export const J = new KeyButton(Key.J);

    //% fixedInstance whenUsed
    export const K = new KeyButton(Key.K);

    //% fixedInstance whenUsed
    export const L = new KeyButton(Key.L);

    //% fixedInstance whenUsed
    export const M = new KeyButton(Key.M);

    //% fixedInstance whenUsed
    export const N = new KeyButton(Key.N);

    //% fixedInstance whenUsed
    export const O = new KeyButton(Key.O);

    //% fixedInstance whenUsed
    export const P = new KeyButton(Key.P);

    //% fixedInstance whenUsed
    export const Q = new KeyButton(Key.Q);

    //% fixedInstance whenUsed
    export const R = new KeyButton(Key.R);

    //% fixedInstance whenUsed
    export const S = new KeyButton(Key.S);

    //% fixedInstance whenUsed
    export const T = new KeyButton(Key.T);

    //% fixedInstance whenUsed
    export const U = new KeyButton(Key.U);

    //% fixedInstance whenUsed
    export const V = new KeyButton(Key.V);

    //% fixedInstance whenUsed
    export const W = new KeyButton(Key.W);

    //% fixedInstance whenUsed
    export const X = new KeyButton(Key.X);

    //% fixedInstance whenUsed
    export const Y = new KeyButton(Key.Y);

    //% fixedInstance whenUsed
    export const Z = new KeyButton(Key.Z);

    //% fixedInstance whenUsed
    export const Zero = new KeyButton(Key.Zero);

    //% fixedInstance whenUsed
    export const One = new KeyButton(Key.One);

    //% fixedInstance whenUsed
    export const Two = new KeyButton(Key.Two);

    //% fixedInstance whenUsed
    export const Three = new KeyButton(Key.Three);

    //% fixedInstance whenUsed
    export const Four = new KeyButton(Key.Four);

    //% fixedInstance whenUsed
    export const Five = new KeyButton(Key.Five);

    //% fixedInstance whenUsed
    export const Six = new KeyButton(Key.Six);

    //% fixedInstance whenUsed
    export const Seven = new KeyButton(Key.Seven);

    //% fixedInstance whenUsed
    export const Eight = new KeyButton(Key.Eight);

    //% fixedInstance whenUsed
    export const Nine = new KeyButton(Key.Nine);

    //% fixedInstance whenUsed
    export const Shift = new KeyButton(Key.Shift);

    //% fixedInstance whenUsed
    export const Enter = new KeyButton(Key.Enter);

    //% fixedInstance whenUsed
    export const Tab = new KeyButton(Key.Tab);

    //% fixedInstance whenUsed
    export const Hyphen = new KeyButton(Key.Hyphen);

    //% fixedInstance whenUsed
    export const Comma = new KeyButton(Key.Comma);

    //% fixedInstance whenUsed
    export const Period = new KeyButton(Key.Period);

    //% fixedInstance whenUsed
    export const BackSpace = new KeyButton(Key.BackSpace);

    //% fixedInstance whenUsed
    export const Any = new KeyButton(0);

    //% blockId=browser_events_setKeyboardRepeatDefault
    //% block="set keyboard repeat delay $delay ms interval $interval ms"
    //% delay.defl=500
    //% interval.defl=30
    //% group="Keyboard"
    //% weight=0
    export function setKeyboardRepeatDefault(delay: number, interval: number) {
        defaultRepeatDelay = Math.max(delay, 0);
        defaultRepeatInterval = Math.max(interval, 1);
    }

    //% block="on any key $event"
    //% group="Keyboard"
    //% weight=98
    //% draggableParameters = reporter
    export function onAnyKeyEvent(event: KeyEvent, handler: (keyEvent: string) => void) {
        // サポートされているキーボタンにハンドラーを登録
        const allKeys = [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
            Zero, One, Two, Three, Four, Five, Six, Seven, Eight, Nine,
            Shift, Enter, Tab, Hyphen, Comma, Period, BackSpace];
        for (const key of allKeys) {
            key.addEventListener(event, () => {
                handler(keyToString(key.id as Key));
            });
        }
    }

    //% blockId=browser_events_lastKeyPressed
    //% block="last key pressed"
    //% group="Keyboard"
    //% weight=97
    export function lastKeyPressed(): string {
        return keyToString(_lastKeyPressed) || "Unknown";
    }
}