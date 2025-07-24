import express from 'express'
import cluster from 'cluster'
import os from 'os'


const totalCpus = os.cpus().length;
const port = 3000;

if (cluster.isPrimary) {
    console.log(`Number of CPUs is ${totalCpus}`);
    console.log(`Primary ${process.pid} is running`);

    //   fork workers
    for (let i = 0; i < totalCpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Let's fork another worker!");

        cluster.fork();

    });

} else {
    const app = express();

    app.use(express.json());

    app.get("/api/:n", function (req, res) {
        let n = parseInt(req.params.n);
        let count = 0;

        if (n > 5000000000) n = 5000000000;

        for (let i = 0; i <= n; i++) {
            count += i;
        }

        res.send(`Final count is ${count} ${process.pid}`);
    });

    app.get('v1/api/:id', (req, res) => {
        const { id } = req.params;
        return res.json(`Process id is ${process.pid} and ${id} `)
    })

    app.get('/cores', (req, res) => {
        return res.json(`CPU cores of the machine are ${totalCpus}`)
    })

    app.listen(port, () => {
        console.log(`Listening at Port ${port}`);
    });

}

