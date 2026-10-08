import click

from tomechat.startup import main as startup_main


@click.group(help="Tomechat command line tool")
def main(): ...


main.add_command(startup_main, "start")


if __name__ == "__main__":
    main()
