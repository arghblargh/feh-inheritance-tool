# @AUTHOR: Piplopp <https://github.com/Piplopp>
# @DATE: 05/2017
#
# @DESC This script generates a blank template for translation of the fire emblem
# heroes unit names, weapons, assit, special and passive skills for the
# feh-inheritance-tool <https://github.com/arghblargh/feh-inheritance-tool>.
#
# It will parse the english files in data/ to extract all fields to translate.
#
# @NOTE Default configuration provide an unstructured template (still a bit
# ordered tho).
# This is written in Python3 (better forget about dinopython)

import json
import os
from collections import OrderedDict

def generate_template(dir_path='data/', structured=True):
    fname = dir_path+'template.json'

    # Check if a blank template already exists
    if os.path.exists(fname):
        s = ("WARNING: File a blank template file already exists, please "
        "rename or remove the "+fname+" file.")
        print(s)
        exit(-1)

    # Else process
    dict_out = OrderedDict()
    dict_out.update(process_units(dir_path, structured))
    dict_out.update(process_default(dir_path, structured))
    dict_out.update(process_passives(dir_path, structured))

    with open(fname, 'w') as outfile:
        json.dump(dict_out, outfile, indent=4, sort_keys=False, ensure_ascii=False)


def process_default(dir_path, structured):
    """
        Process assits, specials and weapons files
        Return order is:
            Weapons, Assists, Specials

        Note: each category is sorted too (aka: weapons from A to Z; then
        assists from A to Z; then specials from A to Z)
    """
    base_files = ( 'weapons.json', 'assists.json', 'specials.json' )
    dict_out = OrderedDict()

    if not structured:
        for f in base_files:
            with open(dir_path+f) as infile:
                dict_in = json.load(infile)
                tmp_dict = {
                    entry: {
                        f: "" for f in ('effect', 'name')
                    } for entry,fields in dict_in.items()
                }
                dict_out.update(OrderedDict(sorted(tmp_dict.items(), key=lambda t: t[0])))
    else:
        for f in base_files:
            with open(dir_path+f) as infile:
                dict_in = json.load(infile)
                tmp_dict = {
                    os.path.basename(f.split('.')[0].upper()): {
                        entry: {
                            f: "" for f in ('effect', 'name')
                        } for entry,fields in dict_in.items()
                    }
                }
                # Sort alphanumeric the second level
                for entry in tmp_dict:
                    tmp_dict[entry] = OrderedDict(sorted(tmp_dict[entry].items(), key=lambda t: t[0]))
                # Add new entry (weapons, assists, specials) in order
                dict_out.update(OrderedDict(sorted(tmp_dict.items(), key=lambda t: t[0])))

    return dict_out


def process_units(dir_path, structured):
    """
        Process units file, sorted by their names
    """
    with open(dir_path+'units.json') as infile:
        dict_in = json.load(infile)
        if not structured:
            dict_out = { entry: {"name": ""} for entry in dict_in.keys() }
            dict_out = OrderedDict(sorted(dict_out.items(), key=lambda t: t[0]))
        else:
            dict_out = { "HEROES": { entry: {"name": ""} for entry in dict_in.keys() } }
            dict_out["HEROES"] = OrderedDict(sorted(dict_out["HEROES"].items(), key=lambda t: t[0]))

    return dict_out


def process_passives(dir_path, structured):
    """
        Process passives file, sorted by 1st: passive slot then alphabetical

        Note: AKA: slot A from A to Z; then slot B from A to Z...
    """
    with open(dir_path+'passives.json') as infile:
        dict_in = json.load(infile)

    dict_out = {
        "PASSIVE_"+passives_type.upper(): {
            entry: {
                f: "" for f in ('effect', 'name')
            } for entry, fields in passives.items()
        } for passives_type, passives in dict_in.items()
    }
    # Sort PASSIVE_A,B & C
    dict_out = OrderedDict(sorted(dict_out.items(), key=lambda t: t[0]))
    # Sort alphanumeric the second level (inside PASSIVE_*)
    for entry in dict_out:
        dict_out[entry] = OrderedDict(sorted(dict_out[entry].items(), key=lambda t: t[0]))

    if not structured:
        tmp_dict = OrderedDict()
        for entry in dict_out:
            tmp_dict.update(dict_out[entry])
        dict_out = tmp_dict

    return dict_out




if __name__ == '__main__':
    # generate_template()
    generate_template(structured=False)
