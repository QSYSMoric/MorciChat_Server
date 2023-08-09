//双向绑定对象
module.exports = class IdMapping {
    constructor() {
      this.mapping = {};
    }
    
    addMapping(id1, id2) {
      this.mapping[id1] = id2;
      this.mapping[id2] = id1;
    }

    getId(id) {
      return this.mapping[id];
    }
}
