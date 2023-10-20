const xrFrameSystem = wx.getXrFrameSystem();


const AutoRotateSchema = {
    speed: {
        type: 'number-array',
        defaultValue: [1, 1, 1]
    }
}

xrFrameSystem.registerComponent('auto-rotate', class AutoRotate extends xrFrameSystem.Component {
    schema = AutoRotateSchema;

    _speedX = 1;
    _speedY = 1;
    _speedZ = 1;

    onAdd(parent, data) {
        this._processData(data);
    }

    onUpdate(data, preData) {
        this._processData(data);
    }

    onTick(delta, data) {
        const trs = this.el.getComponent(xrFrameSystem.Transform);
        if (!trs) {
            return;
        }

        trs.rotation.x += this._speedX * 0.1;
        trs.rotation.y += this._speedY * 0.1;
        trs.rotation.z += this._speedZ * 0.1;
    }

    onRemove(parent, data) {

    }

    _processData(data) {
        this._speedX = data.speed?.[0] !== undefined ? data.speed[0] : 1;
        this._speedY = data.speed?.[1] !== undefined ? data.speed[1] : 1;
        this._speedZ = data.speed?.[2] !== undefined ? data.speed[2] : 1;
    }
});