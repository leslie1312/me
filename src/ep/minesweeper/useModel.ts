import { reactive, toRefs } from "vue"
import { Model } from "./model"

export function useModel() {
  const model = reactive(new Model())
  const { state, board, grids, flags, timer } = toRefs(model)

  return {
    state,
    board,
    grids,
    flags,
    timer,
    init: model.init.bind(model),
    load: model.load.bind(model),
    save: model.save.bind(model),
    redo: model.redo.bind(model),
    open: model.open.bind(model),
    mark: model.mark.bind(model),
    uidToPos: model.uidToPos.bind(model),
    posToUid: model.posToUid.bind(model),
    getHighlight: model.getHighlight.bind(model),
  }
}
