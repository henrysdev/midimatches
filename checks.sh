# frontend
cd assets/
npm install
npm test
cd ..

# backend
mix dialyzer
mix coveralls
mix format
mix credo --strict
mix deps.clean --unused
