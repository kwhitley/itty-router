import { Router, flow } from '../src'

const app = Router()
app.get('/', () => 'Hello Itty!')

export default flow(app)
