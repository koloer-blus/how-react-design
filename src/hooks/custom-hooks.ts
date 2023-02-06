type IEffect = {
  execulate: () => void;
  deps: Set<any>;
};
const effectStack: IEffect[] = [];

function subscribe(effect: IEffect, subs: Set<any>) {
  subs.add(effect);
  effect.deps.add(subs);
}

function cleanup(effect: IEffect) {
  for (const subs of effect.deps) {
    subs.delete(effect);
  }
  effect.deps.clear();
}

function useState<T>(value?: T) {
  const subs = new Set<any>();
  let state = value;
  const getter = () => {
    const effect = effectStack[effectStack.length - 1];
    if (effect) {
      subscribe(effect, subs);
    }
    return state;
  };

  const setter = (nextValue: T) => {
    state = nextValue;
    for (const effect of [...subs]) {
      effect.execulate();
    }
  }

  return [getter, setter];
}


function useEffect(callback: () => any) {
  const execulate = () => {
    cleanup(effect);
    effectStack.push(effect);
    try {
      callback();
    } catch (error) {
      effectStack.pop();
    }
  }

  const effect = {
    execulate,
    deps: new Set()
  };

  execulate()
}

function useMemo<T>(callback: T) {
  const [state, setState] = useState<T>();
  useEffect(() => setState(callback));
  return state;
}