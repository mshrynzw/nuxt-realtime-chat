import { GetterTree, ActionTree, MutationTree } from 'vuex'

export const state = () => ({
    authState: {
      event: null as string | null,
      session: null as any | null
    }
  })

export type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
    setAuthState(state, { event, session }: { event: string | null; session: any | null }) {
      state.authState = { event, session }
    }
  }

export const actions: ActionTree<RootState, RootState> = {
    nuxtServerInit({ commit }, { req }) {
      // サーバーサイドでの初期化処理（必要に応じて）
    }
  }

export const getters: GetterTree<RootState, RootState> = {
    // ゲッターが必要な場合はここに追加
}