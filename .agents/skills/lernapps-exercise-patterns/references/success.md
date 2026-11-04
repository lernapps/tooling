# How an exercise checks success

## Property, not model solution

- Check what the text asks: "a fraction equal to 1/2" accepts 2/4 and 3/6; "a conductor" accepts every conductor.
- "Order the steps" only where the order is fixed.
- A type that cannot accept every correct answer (ordering with a free order, single choice with two defensible
  options) → another type or another text.

## Write down first, in the content method

1. The answers that fulfil the text, including correct ones other than yours.
2. The typical wrong answers.
3. The feedback for each.

## Feedback on a wrong answer

- Every wrong option says why it does not fit.
- Computed tasks: 2–3 common mistakes, each with its message.
- Optionally a hint: where to look, not the answer.
- A component of your own: right or wrong, plus a short reason.

## Examples as tests

- Each exercise lists other correct answers the text allows as accepted, and typical wrong ones as rejected. The
  build runs them through the real check; learners never see them.
- An accepted example fails → the exercise checks the wrong thing: change the type or the check, not the example.
- The archetype's skill says the notation (`examples`, `mistakes`, component tests).
