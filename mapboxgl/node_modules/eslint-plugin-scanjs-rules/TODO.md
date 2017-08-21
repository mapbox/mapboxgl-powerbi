TODO
====
* look at existing eslint rules. they can also identify things like window['setTimeout'](), which is pretty neat.
* remove rules that are in an upstream rule. this saves us maintenance work. hopefully.
* eval:
*** eslint's no-eval: Only checks for calls, not identifier use (see below).
*** eslint no-implied-eval, same for setTimeout/setInterval/execScript
*** neither of those rules look at the function constructor or
generateCRFMReequest

* Q: What do we want to do about "dangerous" functions?
** Just disallow the call, i.e. "eval()" or everything, i.e. foo=eval
    The latter will shore more things, but may contain false positives.
    Currently: mostly just checking for someone calling them. The other way is
    can be seen in identifier_… rules.
* Differentiate between warnings and errors
