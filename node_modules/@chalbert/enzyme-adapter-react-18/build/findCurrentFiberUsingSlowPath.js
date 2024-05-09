"use strict";

// Extracted from https://github.com/facebook/react/blob/a724a3b578dce77d427bef313102a4d0e978d9b4/packages/react-reconciler/src/ReactFiberTreeReflection.js
var HostRoot = 3;
var Placement = 2;
var Hydrating = 4096;
var NoFlags = 0;

function getNearestMountedFiber(fiber) {
  var node = fiber;
  var nearestMounted = fiber;

  if (!fiber.alternate) {
    // If there is no alternate, this might be a new tree that isn't inserted
    // yet. If it is, then it will have a pending insertion effect on it.
    var nextNode = node;

    do {
      node = nextNode;

      if ((node.flags & (Placement | Hydrating)) !== NoFlags) {
        // This is an insertion or in-progress hydration. The nearest possible
        // mounted fiber is the parent but we need to continue to figure out
        // if that one is still mounted.
        nearestMounted = node["return"];
      }

      nextNode = node["return"];
    } while (nextNode);
  } else {
    while (node["return"]) {
      node = node["return"];
    }
  }

  if (node.tag === HostRoot) {
    // TODO: Check if this was a nested HostRoot when used with
    // renderContainerIntoSubtree.
    return nearestMounted;
  } // If we didn't hit the root, that means that we're in an disconnected tree
  // that has been unmounted.


  return null;
}

function findCurrentFiberUsingSlowPath(fiber) {
  var alternate = fiber.alternate;

  if (!alternate) {
    // If there is no alternate, then we only need to check if it is mounted.
    var nearestMounted = getNearestMountedFiber(fiber);

    if (nearestMounted === null) {
      throw new Error('Unable to find node on an unmounted component.');
    }

    if (nearestMounted !== fiber) {
      return null;
    }

    return fiber;
  } // If we have two possible branches, we'll walk backwards up to the root
  // to see what path the root points to. On the way we may hit one of the
  // special cases and we'll deal with them.


  var a = fiber;
  var b = alternate; // eslint-disable-next-line no-constant-condition

  while (true) {
    var parentA = a["return"];

    if (parentA === null) {
      // We're at the root.
      break;
    }

    var parentB = parentA.alternate;

    if (parentB === null) {
      // There is no alternate. This is an unusual case. Currently, it only
      // happens when a Suspense component is hidden. An extra fragment fiber
      // is inserted in between the Suspense fiber and its children. Skip
      // over this extra fragment fiber and proceed to the next parent.
      var nextParent = parentA["return"];

      if (nextParent !== null) {
        a = b = nextParent;
        continue;
      } // If there's no parent, we're at the root.


      break;
    } // If both copies of the parent fiber point to the same child, we can
    // assume that the child is current. This happens when we bailout on low
    // priority: the bailed out fiber's child reuses the current child.


    if (parentA.child === parentB.child) {
      var child = parentA.child;

      while (child) {
        if (child === a) {
          // We've determined that A is the current branch.
          return fiber;
        }

        if (child === b) {
          // We've determined that B is the current branch.
          return alternate;
        }

        child = child.sibling;
      } // We should never have an alternate for any mounting node. So the only
      // way this could possibly happen is if this was unmounted, if at all.


      throw new Error('Unable to find node on an unmounted component.');
    }

    if (a["return"] !== b["return"]) {
      // The return pointer of A and the return pointer of B point to different
      // fibers. We assume that return pointers never criss-cross, so A must
      // belong to the child set of A.return, and B must belong to the child
      // set of B.return.
      a = parentA;
      b = parentB;
    } else {
      // The return pointers point to the same fiber. We'll have to use the
      // default, slow path: scan the child sets of each parent alternate to see
      // which child belongs to which set.
      //
      // Search parent A's child set
      var didFindChild = false;
      var _child = parentA.child;

      while (_child) {
        if (_child === a) {
          didFindChild = true;
          a = parentA;
          b = parentB;
          break;
        }

        if (_child === b) {
          didFindChild = true;
          b = parentA;
          a = parentB;
          break;
        }

        _child = _child.sibling;
      }

      if (!didFindChild) {
        // Search parent B's child set
        _child = parentB.child;

        while (_child) {
          if (_child === a) {
            didFindChild = true;
            a = parentB;
            b = parentA;
            break;
          }

          if (_child === b) {
            didFindChild = true;
            b = parentB;
            a = parentA;
            break;
          }

          _child = _child.sibling;
        }

        if (!didFindChild) {
          throw new Error('Child was not found in either parent set. This indicates a bug ' + 'in React related to the return pointer. Please file an issue.');
        }
      }
    }

    if (a.alternate !== b) {
      throw new Error("Return fibers should always be each others' alternates. " + 'This error is likely caused by a bug in React. Please file an issue.');
    }
  } // If the root is not a host container, we're in a disconnected tree. I.e.
  // unmounted.


  if (a.tag !== HostRoot) {
    throw new Error('Unable to find node on an unmounted component.');
  }

  if (a.stateNode.current === a) {
    // We've determined that A is the current branch.
    return fiber;
  } // Otherwise B has to be current branch.


  return alternate;
}

module.exports = findCurrentFiberUsingSlowPath;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIb3N0Um9vdCIsIlBsYWNlbWVudCIsIkh5ZHJhdGluZyIsIk5vRmxhZ3MiLCJnZXROZWFyZXN0TW91bnRlZEZpYmVyIiwiZmliZXIiLCJub2RlIiwibmVhcmVzdE1vdW50ZWQiLCJhbHRlcm5hdGUiLCJuZXh0Tm9kZSIsImZsYWdzIiwidGFnIiwiZmluZEN1cnJlbnRGaWJlclVzaW5nU2xvd1BhdGgiLCJFcnJvciIsImEiLCJiIiwicGFyZW50QSIsInBhcmVudEIiLCJuZXh0UGFyZW50IiwiY2hpbGQiLCJzaWJsaW5nIiwiZGlkRmluZENoaWxkIiwic3RhdGVOb2RlIiwiY3VycmVudCIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlcyI6WyIuLi9zcmMvZmluZEN1cnJlbnRGaWJlclVzaW5nU2xvd1BhdGguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gRXh0cmFjdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2Jsb2IvYTcyNGEzYjU3OGRjZTc3ZDQyN2JlZjMxMzEwMmE0ZDBlOTc4ZDliNC9wYWNrYWdlcy9yZWFjdC1yZWNvbmNpbGVyL3NyYy9SZWFjdEZpYmVyVHJlZVJlZmxlY3Rpb24uanNcblxuY29uc3QgSG9zdFJvb3QgPSAzO1xuXG5jb25zdCBQbGFjZW1lbnQgPSAwYjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTA7XG5jb25zdCBIeWRyYXRpbmcgPSAwYjAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDA7XG5jb25zdCBOb0ZsYWdzID0gMGIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwO1xuXG5mdW5jdGlvbiBnZXROZWFyZXN0TW91bnRlZEZpYmVyKGZpYmVyKSB7XG4gIGxldCBub2RlID0gZmliZXI7XG4gIGxldCBuZWFyZXN0TW91bnRlZCA9IGZpYmVyO1xuICBpZiAoIWZpYmVyLmFsdGVybmF0ZSkge1xuICAgIC8vIElmIHRoZXJlIGlzIG5vIGFsdGVybmF0ZSwgdGhpcyBtaWdodCBiZSBhIG5ldyB0cmVlIHRoYXQgaXNuJ3QgaW5zZXJ0ZWRcbiAgICAvLyB5ZXQuIElmIGl0IGlzLCB0aGVuIGl0IHdpbGwgaGF2ZSBhIHBlbmRpbmcgaW5zZXJ0aW9uIGVmZmVjdCBvbiBpdC5cbiAgICBsZXQgbmV4dE5vZGUgPSBub2RlO1xuICAgIGRvIHtcbiAgICAgIG5vZGUgPSBuZXh0Tm9kZTtcbiAgICAgIGlmICgobm9kZS5mbGFncyAmIChQbGFjZW1lbnQgfCBIeWRyYXRpbmcpKSAhPT0gTm9GbGFncykge1xuICAgICAgICAvLyBUaGlzIGlzIGFuIGluc2VydGlvbiBvciBpbi1wcm9ncmVzcyBoeWRyYXRpb24uIFRoZSBuZWFyZXN0IHBvc3NpYmxlXG4gICAgICAgIC8vIG1vdW50ZWQgZmliZXIgaXMgdGhlIHBhcmVudCBidXQgd2UgbmVlZCB0byBjb250aW51ZSB0byBmaWd1cmUgb3V0XG4gICAgICAgIC8vIGlmIHRoYXQgb25lIGlzIHN0aWxsIG1vdW50ZWQuXG4gICAgICAgIG5lYXJlc3RNb3VudGVkID0gbm9kZS5yZXR1cm47XG4gICAgICB9XG4gICAgICBuZXh0Tm9kZSA9IG5vZGUucmV0dXJuO1xuICAgIH0gd2hpbGUgKG5leHROb2RlKTtcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAobm9kZS5yZXR1cm4pIHtcbiAgICAgIG5vZGUgPSBub2RlLnJldHVybjtcbiAgICB9XG4gIH1cbiAgaWYgKG5vZGUudGFnID09PSBIb3N0Um9vdCkge1xuICAgIC8vIFRPRE86IENoZWNrIGlmIHRoaXMgd2FzIGEgbmVzdGVkIEhvc3RSb290IHdoZW4gdXNlZCB3aXRoXG4gICAgLy8gcmVuZGVyQ29udGFpbmVySW50b1N1YnRyZWUuXG4gICAgcmV0dXJuIG5lYXJlc3RNb3VudGVkO1xuICB9XG4gIC8vIElmIHdlIGRpZG4ndCBoaXQgdGhlIHJvb3QsIHRoYXQgbWVhbnMgdGhhdCB3ZSdyZSBpbiBhbiBkaXNjb25uZWN0ZWQgdHJlZVxuICAvLyB0aGF0IGhhcyBiZWVuIHVubW91bnRlZC5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGZpbmRDdXJyZW50RmliZXJVc2luZ1Nsb3dQYXRoKGZpYmVyKSB7XG4gIGNvbnN0IGFsdGVybmF0ZSA9IGZpYmVyLmFsdGVybmF0ZTtcbiAgaWYgKCFhbHRlcm5hdGUpIHtcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBhbHRlcm5hdGUsIHRoZW4gd2Ugb25seSBuZWVkIHRvIGNoZWNrIGlmIGl0IGlzIG1vdW50ZWQuXG4gICAgY29uc3QgbmVhcmVzdE1vdW50ZWQgPSBnZXROZWFyZXN0TW91bnRlZEZpYmVyKGZpYmVyKTtcblxuICAgIGlmIChuZWFyZXN0TW91bnRlZCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZmluZCBub2RlIG9uIGFuIHVubW91bnRlZCBjb21wb25lbnQuJyk7XG4gICAgfVxuXG4gICAgaWYgKG5lYXJlc3RNb3VudGVkICE9PSBmaWJlcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBmaWJlcjtcbiAgfVxuICAvLyBJZiB3ZSBoYXZlIHR3byBwb3NzaWJsZSBicmFuY2hlcywgd2UnbGwgd2FsayBiYWNrd2FyZHMgdXAgdG8gdGhlIHJvb3RcbiAgLy8gdG8gc2VlIHdoYXQgcGF0aCB0aGUgcm9vdCBwb2ludHMgdG8uIE9uIHRoZSB3YXkgd2UgbWF5IGhpdCBvbmUgb2YgdGhlXG4gIC8vIHNwZWNpYWwgY2FzZXMgYW5kIHdlJ2xsIGRlYWwgd2l0aCB0aGVtLlxuICBsZXQgYSA9IGZpYmVyO1xuICBsZXQgYiA9IGFsdGVybmF0ZTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IHBhcmVudEEgPSBhLnJldHVybjtcbiAgICBpZiAocGFyZW50QSA9PT0gbnVsbCkge1xuICAgICAgLy8gV2UncmUgYXQgdGhlIHJvb3QuXG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc3QgcGFyZW50QiA9IHBhcmVudEEuYWx0ZXJuYXRlO1xuICAgIGlmIChwYXJlbnRCID09PSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBubyBhbHRlcm5hdGUuIFRoaXMgaXMgYW4gdW51c3VhbCBjYXNlLiBDdXJyZW50bHksIGl0IG9ubHlcbiAgICAgIC8vIGhhcHBlbnMgd2hlbiBhIFN1c3BlbnNlIGNvbXBvbmVudCBpcyBoaWRkZW4uIEFuIGV4dHJhIGZyYWdtZW50IGZpYmVyXG4gICAgICAvLyBpcyBpbnNlcnRlZCBpbiBiZXR3ZWVuIHRoZSBTdXNwZW5zZSBmaWJlciBhbmQgaXRzIGNoaWxkcmVuLiBTa2lwXG4gICAgICAvLyBvdmVyIHRoaXMgZXh0cmEgZnJhZ21lbnQgZmliZXIgYW5kIHByb2NlZWQgdG8gdGhlIG5leHQgcGFyZW50LlxuICAgICAgY29uc3QgbmV4dFBhcmVudCA9IHBhcmVudEEucmV0dXJuO1xuICAgICAgaWYgKG5leHRQYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgYSA9IGIgPSBuZXh0UGFyZW50O1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gcGFyZW50LCB3ZSdyZSBhdCB0aGUgcm9vdC5cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIElmIGJvdGggY29waWVzIG9mIHRoZSBwYXJlbnQgZmliZXIgcG9pbnQgdG8gdGhlIHNhbWUgY2hpbGQsIHdlIGNhblxuICAgIC8vIGFzc3VtZSB0aGF0IHRoZSBjaGlsZCBpcyBjdXJyZW50LiBUaGlzIGhhcHBlbnMgd2hlbiB3ZSBiYWlsb3V0IG9uIGxvd1xuICAgIC8vIHByaW9yaXR5OiB0aGUgYmFpbGVkIG91dCBmaWJlcidzIGNoaWxkIHJldXNlcyB0aGUgY3VycmVudCBjaGlsZC5cbiAgICBpZiAocGFyZW50QS5jaGlsZCA9PT0gcGFyZW50Qi5jaGlsZCkge1xuICAgICAgbGV0IGNoaWxkID0gcGFyZW50QS5jaGlsZDtcbiAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQgPT09IGEpIHtcbiAgICAgICAgICAvLyBXZSd2ZSBkZXRlcm1pbmVkIHRoYXQgQSBpcyB0aGUgY3VycmVudCBicmFuY2guXG4gICAgICAgICAgcmV0dXJuIGZpYmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZCA9PT0gYikge1xuICAgICAgICAgIC8vIFdlJ3ZlIGRldGVybWluZWQgdGhhdCBCIGlzIHRoZSBjdXJyZW50IGJyYW5jaC5cbiAgICAgICAgICByZXR1cm4gYWx0ZXJuYXRlO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkID0gY2hpbGQuc2libGluZztcbiAgICAgIH1cblxuICAgICAgLy8gV2Ugc2hvdWxkIG5ldmVyIGhhdmUgYW4gYWx0ZXJuYXRlIGZvciBhbnkgbW91bnRpbmcgbm9kZS4gU28gdGhlIG9ubHlcbiAgICAgIC8vIHdheSB0aGlzIGNvdWxkIHBvc3NpYmx5IGhhcHBlbiBpcyBpZiB0aGlzIHdhcyB1bm1vdW50ZWQsIGlmIGF0IGFsbC5cbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGZpbmQgbm9kZSBvbiBhbiB1bm1vdW50ZWQgY29tcG9uZW50LicpO1xuICAgIH1cblxuICAgIGlmIChhLnJldHVybiAhPT0gYi5yZXR1cm4pIHtcbiAgICAgIC8vIFRoZSByZXR1cm4gcG9pbnRlciBvZiBBIGFuZCB0aGUgcmV0dXJuIHBvaW50ZXIgb2YgQiBwb2ludCB0byBkaWZmZXJlbnRcbiAgICAgIC8vIGZpYmVycy4gV2UgYXNzdW1lIHRoYXQgcmV0dXJuIHBvaW50ZXJzIG5ldmVyIGNyaXNzLWNyb3NzLCBzbyBBIG11c3RcbiAgICAgIC8vIGJlbG9uZyB0byB0aGUgY2hpbGQgc2V0IG9mIEEucmV0dXJuLCBhbmQgQiBtdXN0IGJlbG9uZyB0byB0aGUgY2hpbGRcbiAgICAgIC8vIHNldCBvZiBCLnJldHVybi5cbiAgICAgIGEgPSBwYXJlbnRBO1xuICAgICAgYiA9IHBhcmVudEI7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSByZXR1cm4gcG9pbnRlcnMgcG9pbnQgdG8gdGhlIHNhbWUgZmliZXIuIFdlJ2xsIGhhdmUgdG8gdXNlIHRoZVxuICAgICAgLy8gZGVmYXVsdCwgc2xvdyBwYXRoOiBzY2FuIHRoZSBjaGlsZCBzZXRzIG9mIGVhY2ggcGFyZW50IGFsdGVybmF0ZSB0byBzZWVcbiAgICAgIC8vIHdoaWNoIGNoaWxkIGJlbG9uZ3MgdG8gd2hpY2ggc2V0LlxuICAgICAgLy9cbiAgICAgIC8vIFNlYXJjaCBwYXJlbnQgQSdzIGNoaWxkIHNldFxuICAgICAgbGV0IGRpZEZpbmRDaGlsZCA9IGZhbHNlO1xuICAgICAgbGV0IGNoaWxkID0gcGFyZW50QS5jaGlsZDtcbiAgICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQgPT09IGEpIHtcbiAgICAgICAgICBkaWRGaW5kQ2hpbGQgPSB0cnVlO1xuICAgICAgICAgIGEgPSBwYXJlbnRBO1xuICAgICAgICAgIGIgPSBwYXJlbnRCO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZCA9PT0gYikge1xuICAgICAgICAgIGRpZEZpbmRDaGlsZCA9IHRydWU7XG4gICAgICAgICAgYiA9IHBhcmVudEE7XG4gICAgICAgICAgYSA9IHBhcmVudEI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGQgPSBjaGlsZC5zaWJsaW5nO1xuICAgICAgfVxuICAgICAgaWYgKCFkaWRGaW5kQ2hpbGQpIHtcbiAgICAgICAgLy8gU2VhcmNoIHBhcmVudCBCJ3MgY2hpbGQgc2V0XG4gICAgICAgIGNoaWxkID0gcGFyZW50Qi5jaGlsZDtcbiAgICAgICAgd2hpbGUgKGNoaWxkKSB7XG4gICAgICAgICAgaWYgKGNoaWxkID09PSBhKSB7XG4gICAgICAgICAgICBkaWRGaW5kQ2hpbGQgPSB0cnVlO1xuICAgICAgICAgICAgYSA9IHBhcmVudEI7XG4gICAgICAgICAgICBiID0gcGFyZW50QTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQgPT09IGIpIHtcbiAgICAgICAgICAgIGRpZEZpbmRDaGlsZCA9IHRydWU7XG4gICAgICAgICAgICBiID0gcGFyZW50QjtcbiAgICAgICAgICAgIGEgPSBwYXJlbnRBO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoaWxkID0gY2hpbGQuc2libGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGlkRmluZENoaWxkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0NoaWxkIHdhcyBub3QgZm91bmQgaW4gZWl0aGVyIHBhcmVudCBzZXQuIFRoaXMgaW5kaWNhdGVzIGEgYnVnICcgK1xuICAgICAgICAgICAgICAnaW4gUmVhY3QgcmVsYXRlZCB0byB0aGUgcmV0dXJuIHBvaW50ZXIuIFBsZWFzZSBmaWxlIGFuIGlzc3VlLicsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhLmFsdGVybmF0ZSAhPT0gYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIlJldHVybiBmaWJlcnMgc2hvdWxkIGFsd2F5cyBiZSBlYWNoIG90aGVycycgYWx0ZXJuYXRlcy4gXCIgK1xuICAgICAgICAgICdUaGlzIGVycm9yIGlzIGxpa2VseSBjYXVzZWQgYnkgYSBidWcgaW4gUmVhY3QuIFBsZWFzZSBmaWxlIGFuIGlzc3VlLicsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSByb290IGlzIG5vdCBhIGhvc3QgY29udGFpbmVyLCB3ZSdyZSBpbiBhIGRpc2Nvbm5lY3RlZCB0cmVlLiBJLmUuXG4gIC8vIHVubW91bnRlZC5cbiAgaWYgKGEudGFnICE9PSBIb3N0Um9vdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGZpbmQgbm9kZSBvbiBhbiB1bm1vdW50ZWQgY29tcG9uZW50LicpO1xuICB9XG5cbiAgaWYgKGEuc3RhdGVOb2RlLmN1cnJlbnQgPT09IGEpIHtcbiAgICAvLyBXZSd2ZSBkZXRlcm1pbmVkIHRoYXQgQSBpcyB0aGUgY3VycmVudCBicmFuY2guXG4gICAgcmV0dXJuIGZpYmVyO1xuICB9XG4gIC8vIE90aGVyd2lzZSBCIGhhcyB0byBiZSBjdXJyZW50IGJyYW5jaC5cbiAgcmV0dXJuIGFsdGVybmF0ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmaW5kQ3VycmVudEZpYmVyVXNpbmdTbG93UGF0aDtcbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUVBLElBQU1BLFFBQVEsR0FBRyxDQUFqQjtBQUVBLElBQU1DLFNBQVMsR0FBRyxDQUFsQjtBQUNBLElBQU1DLFNBQVMsR0FBRyxJQUFsQjtBQUNBLElBQU1DLE9BQU8sR0FBRyxDQUFoQjs7QUFFQSxTQUFTQyxzQkFBVCxDQUFnQ0MsS0FBaEMsRUFBdUM7RUFDckMsSUFBSUMsSUFBSSxHQUFHRCxLQUFYO0VBQ0EsSUFBSUUsY0FBYyxHQUFHRixLQUFyQjs7RUFDQSxJQUFJLENBQUNBLEtBQUssQ0FBQ0csU0FBWCxFQUFzQjtJQUNwQjtJQUNBO0lBQ0EsSUFBSUMsUUFBUSxHQUFHSCxJQUFmOztJQUNBLEdBQUc7TUFDREEsSUFBSSxHQUFHRyxRQUFQOztNQUNBLElBQUksQ0FBQ0gsSUFBSSxDQUFDSSxLQUFMLElBQWNULFNBQVMsR0FBR0MsU0FBMUIsQ0FBRCxNQUEyQ0MsT0FBL0MsRUFBd0Q7UUFDdEQ7UUFDQTtRQUNBO1FBQ0FJLGNBQWMsR0FBR0QsSUFBSSxVQUFyQjtNQUNEOztNQUNERyxRQUFRLEdBQUdILElBQUksVUFBZjtJQUNELENBVEQsUUFTU0csUUFUVDtFQVVELENBZEQsTUFjTztJQUNMLE9BQU9ILElBQUksVUFBWCxFQUFvQjtNQUNsQkEsSUFBSSxHQUFHQSxJQUFJLFVBQVg7SUFDRDtFQUNGOztFQUNELElBQUlBLElBQUksQ0FBQ0ssR0FBTCxLQUFhWCxRQUFqQixFQUEyQjtJQUN6QjtJQUNBO0lBQ0EsT0FBT08sY0FBUDtFQUNELENBMUJvQyxD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
//# sourceMappingURL=findCurrentFiberUsingSlowPath.js.map