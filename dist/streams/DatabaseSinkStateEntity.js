"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSinkStateEntity = void 0;
const typeorm_1 = require("typeorm");
let DatabaseSinkStateEntity = class DatabaseSinkStateEntity {
    id;
    key;
    state;
    constructor(id, key, state) {
        this.id = id;
        this.key = key;
        this.state = state;
    }
};
exports.DatabaseSinkStateEntity = DatabaseSinkStateEntity;
__decorate([
    (0, typeorm_1.Column)({ type: "text", primary: true })
], DatabaseSinkStateEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", primary: true })
], DatabaseSinkStateEntity.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" })
], DatabaseSinkStateEntity.prototype, "state", void 0);
exports.DatabaseSinkStateEntity = DatabaseSinkStateEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "dbsinkstate" })
], DatabaseSinkStateEntity);
//# sourceMappingURL=DatabaseSinkStateEntity.js.map