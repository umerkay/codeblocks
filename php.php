<?php
    //get the code from the frontend
    $code = $_POST['code'];

    //create a file with the code
    $myfile = fopen("code.php", "w") or die("Unable to open file!");
    fwrite($myfile, $code);
    fclose($myfile);

    //execute the code
    $output = shell_exec('php code.php');

    //return the output
    echo $output;
?>