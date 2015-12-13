module.exports = function(RED) {

  function NLCNode(config) {
    RED.nodes.createNode(this, config);
    this.username = config.username;
    this.password = config.password;
    this.classifierid = config.classifierid;
    var node = this;

    this.status({fill:"red",shape:"ring",text:"--------"});

    this.on('input', function(msg) {

      if (!msg.payload) {
        node.error('Missing property: msg.payload');
        return;
      }

      var username = this.username;
      var password = this.password;
      if (!username || !password) {
        node.error('Missing service credentials.');
        this.status({fill:"red",shape:"ring",text:"--------"});
        return;
      }

      this.status({fill:"blue",shape:"ring",text:"--------"});

      var watson = require('watson-developer-cloud');
      var nlc = watson.natural_language_classifier({
        url: 'https://gateway.watsonplatform.net/natural-language-classifier/api',
        username: username,
        password: password,
        version: 'v1'
      });

      nlc.classify({
        text: msg.payload,
        classifier_id: this.classifierid },
        function(err, response) {
          if (err) {
            node.error(err);
          } else {
            msg.text = response.text;
            msg.payload = response.top_class;
            msg.classified = response.classes[0].class_name;
            msg.confidence = response.classes[0].confidence;
          }
          node.send(msg);
        });

      this.status({fill:"green",shape:"ring",text:"--------"});

    });
  }

  RED.nodes.registerType("natural-language-classifier", NLCNode, {
    username: { type: "text" },
    password: { type: "password" },
    classifierid: { type: "text" }
  });
}
