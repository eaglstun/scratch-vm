const SharedDispatch = require('./shared-dispatch');

const log = require('../util/log');

/**
 * This class serves as the central broker for message dispatch. It expects to operate on the main thread / Window and
 * it must be informed of any Worker threads which will participate in the messaging system. From any context in the
 * messaging system, the dispatcher's "call" method can call any method on any "service" provided in any participating
 * context. The dispatch system will forward function arguments and return values across worker boundaries as needed.
 * @see {WorkerDispatch}
 */
class CentralDispatch extends SharedDispatch {
    constructor () {
        super();

        /**
         * Map of channel name to worker or local service provider.
         * If the entry is a Worker, the service is provided by an object on that worker.
         * Otherwise, the service is provided locally and methods on the service will be called directly.
         * @see {setService}
         * @type {object.<Worker|object>}
         */
        this.services = {};

        /**
         * The constructor we will use to recognize workers.
         * @type {Function}
         */
        this.workerClass = (typeof Worker === 'undefined' ? null : Worker);

        /**
         * List of workers attached to this dispatcher.
         * @type {Array}
         */
        this.workers = [];
    }

    /**
     * Set a local object as the global provider of the specified service.
     * WARNING: Any method on the provider can be called from any worker within the dispatch system.
     * @param {string} service - a globally unique string identifying this service. Examples: 'vm', 'gui'.
     * @param {object} provider - a local object which provides this service.
     * @returns {Promise} - a promise which will resolve once the service is registered.
     */
    setService (service, provider) {
        /** Return a promise for consistency with {@link WorkerDispatch#setService} */
        try {
            if (this.services.hasOwnProperty(service)) {
                log.warn(`Central dispatch replacing existing service provider for ${service}`);
            }
            this.services[service] = provider;
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * Add a worker to the message dispatch system. The worker must implement a compatible message dispatch framework.
     * The dispatcher will immediately attempt to "handshake" with the worker.
     * @param {Worker} worker - the worker to add into the dispatch system.
     */
    addWorker (worker) {
        if (this.workers.indexOf(worker) === -1) {
            this.workers.push(worker);
            worker.onmessage = this._onMessage.bind(this, worker);
            this._remoteCall(worker, 'dispatch', 'handshake').catch(e => {
                log.error(`Could not handshake with worker: ${JSON.stringify(e)}`);
            });
        } else {
            log.warn('Central dispatch ignoring attempt to add duplicate worker');
        }
    }

    /**
     * Remove a service provider from the central dispatch service, un-registering any services it provides.
     * If the provider is a worker its dispatch service will be shut down.
     * The worker itself will NOT be terminated by this call.
     * @param {Worker|object} provider - the worker or object instance to be removed.
     */
    removeProvider (provider) {
        const workerIndex = this.workers.indexOf(provider);
        if (workerIndex !== -1) {
            /** @TODO Should we ask the worker to shut down? If so, owner must wait before terminating the worker. */
            this.workers.splice(workerIndex, 1);
        }
        for (const serviceName in Object.keys(this.services)) {
            if (this.services[serviceName] === provider) {
                delete this.services[serviceName];
            }
        }
    }

    /**
     * Fetch the service provider object for a particular service name.
     * @override
     * @param {string} service - the name of the service to look up
     * @returns {{provider:(object|Worker), isRemote:boolean}} - the means to contact the service, if found
     * @protected
     */
    _getServiceProvider (service) {
        const provider = this.services[service];
        return provider && {
            provider,
            isRemote: provider instanceof this.workerClass
        };
    }

    /**
     * Handle a call message sent to the dispatch service itself
     * @override
     * @param {Worker} worker - the worker which sent the message.
     * @param {DispatchCallMessage} message - the message to be handled.
     * @returns {Promise|undefined} - a promise for the results of this operation, if appropriate
     * @protected
     */
    _onDispatchMessage (worker, message) {
        let promise;
        switch (message.method) {
        case 'setService':
            promise = this.setService(message.args[0], worker);
            break;
        default:
            log.error(`Central dispatch received message for unknown method: ${message.method}`);
        }
        return promise;
    }
}

module.exports = new CentralDispatch();
