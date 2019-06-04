import Lib from './lib'

const { Math, Validator } = Lib

const Network = {
  /*
    Neuron represents an activation value of range 0...1,
    activation bias and connection state
   */
  createNeuron: (value, bias = 0) => ({ value, bias }),
  /*
    createNeuronPair connects two neurons and creates connection weight between
   */
  createNeuronPair: (nx, ny, weight = 0) => ({ nx, ny, weight }),
  /*
    Layer represents an array of neurons
   */
  createLayer: neurons => ({ neurons, size: neurons.length }),
  /*
    LayerPair represents two layer's which neuron's are connected to each other
    oneWeight defines the weight value neurons should be connected to each other
   */
  createLayerPair: (lx, ly, oneWeight = Math.randomRange(-10, 10)) => ({
    lx,
    ly,
    /*
      neuronPairs are constructed that way, so at the end we have a neuron
      and all the weights connected to it, so all elements in a row share
      the same ny neuron:
      [
        [ { nPair1 }, { nPair2 } ], // nPair1.ny === nPair2.ny
        [ { nPair3 }, { nPair4 } ]  // nPair3.ny === nPair4.ny
      ]
      In the future, when this project will come more complicated then the basic
      neural network, it would be fair to pass a layer-connecting callback,
      which connects neurons between them
     */
    neuronPairs: ly.neurons.map(ny =>
      lx.neurons.map(nx => Network.createNeuronPair(ny, nx, oneWeight))
    )
  }),
  /*
    Network represents an array of layers and layerPairs with initializing and
    training functionality
   */
  createNetwork: function(
    inLayerSize,
    outLayerSize,
    hidLayersCount,
    hidLayersSize
  ) {
    const layers = [
      Network.createLayer(Array(inLayerSize).map(() => Network.createNeuron())),
      ...Array(hidLayersCount).map(() =>
        Network.createLayer(
          Array(hidLayersSize).map(() =>
            Network.createNeuron(
              Math.randomRange(-10, 10),
              Math.randomRange(-10, 10)
            )
          )
        )
      ),
      Network.createLayer(
        Array(outLayerSize).map(() =>
          Network.createNeuron(
            Math.randomRange(-10, 10),
            Math.randomRange(-10, 10)
          )
        )
      )
    ]

    const layerPairs = Array.from(layers.slice(0, -1), (layer, i) =>
      Network.createLayerPair(layer, layers[i + 1])
    )

    return {
      layers,
      layerPairs,
      init: initData => {
        Validator.validateInitData(initData, inLayerSize)
        layers[0].neurons.forEach((n, i) => {
          n.value = initData[i]
        })
      },
      train: function(trainData) {
        const z = nPair => nPair.weight + nPair.nx.value + nPair.ny.bias

        // Validate trainData
        Validator.validateTrainData(trainData)
        trainData.forEach(trainSample => {
          /*
            LAST LAYER CALCULUS
         */
          layerPairs[layerPairs.length - 1].neuronPairs.forEach(
            (nyPairs, i) => {
              nyPairs.forEach(nPair => {
                /*
                  Calculating derivative of weight value in respect to the Cost value
                  and adding this to the weights on fly
                */

                const derCtoA = nPair.ny.value - trainSample.expect[i]

                nPair.weight +=
                  nPair.nx.value * Math.dSigmoid(z(nPair)) * 2 * derCtoA
                nPair.bias += Math.dSigmoid(z(nPair)) * 2 * derCtoA
              })
            }
          )
          /*
          BACKPROPAGATION
         */
          for (let lp = layerPairs.length - 2; lp >= 0; lp--) {
            const lPair = layerPairs[lp]
            lPair.neuronPairs.forEach((nyPairs, i) => {
              nyPairs.forEach(nPair => {
                // nPair.weight += nPair.nx.value * Math.dSigmoid(z(nPair))
                // TODO: As right here we need to get all neuron weight's from
                //  the right probably { neuron, layer}Pair abstraction is wrong
                //  and Layers should be done in a LinkedList, and neuron have
                //  to form some kind of a tree
              })
            })
          }
        })
      }
    }
  }
}

export default Network
