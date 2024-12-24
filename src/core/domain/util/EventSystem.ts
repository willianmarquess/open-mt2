export default class EventSystem {
    #events = new Map();

    addEvent(id, callback, timeInMs) {
        const timeout = setTimeout(callback, timeInMs);
        this.#events.set(id, timeout);
    }

    cancelEvent(id) {
        const event = this.#events.get(id);
        if (!event) return false;
        clearTimeout(event);
        return true;
    }
}
