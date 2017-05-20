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

import os
import json
import argparse
from collections import OrderedDict


# Some colors
C_FILE = '\033[95m'
C_OKBLUE = '\033[94m'
C_OKGREEN = '\033[92m'
C_WARNING = '\033[93m'
C_FAIL = '\033[91m'
C_ENDC = '\033[0m'

############
# Misc     #
############
def cli():
    """Create and populate the cli parser"""
    parser = argparse.ArgumentParser(
        description= 'Create a blank template for translation purpose or populate an existing one with new entries for update',
    )

    # Args
    parser.add_argument('-s', '--structured',
        action= 'store_true',
        help= 'Strucure the file with one more level (OPTION TO REMOVE IF FORMAT NOT USED)'
    )
    parser.add_argument('-u', '--update',
        metavar= 'file',
        type= existant_file,
        help= 'Update the given file with the new blank entries'
    )
    parser.add_argument('-v', '--verbose',
        action= 'store_true',
        help= 'Increase verbosity output'
    )

    return parser.parse_args()

def existant_file(filepath:str) -> str:
    """Argparse type, raising an error if given file does not exists"""
    if not os.path.exists(filepath):
        raise argparse.ArgumentTypeError(
            "file {} doesn't exists".format(C_FILE + filepath + C_ENDC)
        )
    return filepath

def sort_OD(od):
    """ Sort an OrderedDict by key recursively"""
    out = OrderedDict()
    for key, val in sorted(od.items()):
        if isinstance(val, dict):
            out[key] = sort_OD(val)
        else:
            out[key] = val
    return out



#############################
# Template generation       #
#############################
def main(structured, update, verbose, data_dir='data/'):
    """ Do the checks before calling the update or the template gen methods """
    # Verifications
    if not update:
        fname = 'lang/template.json'
        # Check if a blank template already exists
        if os.path.exists(fname):
            s = (C_WARNING + 'WARNING: ' + C_ENDC + 'A template file seems to already exists: '
            + C_FILE + fname + C_ENDC)
            print(s)
            a = input('(A)bort or (O)verride (default abort): ').lower()
            if a == 'a':
                print(C_FAIL + 'Aborted' + C_ENDC)
                exit(-1)
    # NOTE: Don't need to check if update file exists, parser already did this

    # Processing
    dict_out = _get_data(structured, verbose, data_dir, fname)
    if update:
        @# TODO:
        dict_out = _update_lang_data(update, dict_out)
    else: # generate template
        with open(fname, 'w') as outfile:
            if verbose: print("Writing json to " + C_FILE + fname + C_ENDC)
            json.dump(dict_out, outfile, indent=4, sort_keys=False, ensure_ascii=False)

def _update_lang_data(update, new):
    @# TODO:
    # with open(update, 'rw') as infile:
        # dict_in = json.load(infile, object_pairs_hook=OrderedDict)

def _get_data(structured, verbose, data_dir, fname):
    """ Generate or update the blank template """
    dict_out = OrderedDict()
    dict_out.update(_process_units(data_dir, structured, verbose))
    dict_out.update(_process_default(data_dir, structured, verbose))
    dict_out.update(_process_passives(data_dir, structured, verbose))
    return dict_out

def _process_default(data_dir, structured, verbose):
    """
        Process assits, specials and weapons files
        Return order is:
            Weapons, Assists, Specials
    """
    base_files = ( 'weapons.json', 'assists.json', 'specials.json' )
    dict_out = OrderedDict()

    if not structured:
        for f in base_files:
            if verbose: print('Processing ' + C_FILE + data_dir+f + C_ENDC + '...')
            with open(data_dir+f) as infile:
                dict_in = json.load(infile)
                tmp_dict = {
                    entry: {
                        f: "" for f in ('effect', 'name')
                    } for entry,fields in dict_in.items()
                }
                # Sort effect and and name field
                tmp_dict = sort_OD(tmp_dict)
                # Add sorted new entry (weapons, assists, specials) to global dict
                dict_out.update(OrderedDict(sorted(tmp_dict.items(), key=lambda t: t[0])))
    else:
        for f in base_files:
            if verbose: print('Processing ' + C_FILE + data_dir+f + C_ENDC + '...')
            with open(data_dir+f) as infile:
                dict_in = json.load(infile)
                tmp_dict = {
                    os.path.basename(f.split('.')[0].upper()): {
                        entry: {
                            f: "" for f in ('effect', 'name')
                        } for entry,fields in dict_in.items()
                    }
                }
                # Sort recursively all levels
                tmp_dict = sort_OD(tmp_dict)
                # Add sorted new entry (weapons, assists, specials) to global dict
                dict_out.update(OrderedDict(sorted(tmp_dict.items(), key=lambda t: t[0])))

    return dict_out

def _process_units(data_dir, structured, verbose):
    """
        Process units file, sorted by their names
    """
    if verbose: print('Processing ' + C_FILE + data_dir+'units.json' + C_ENDC + '...')
    with open(data_dir+'units.json') as infile:
        dict_in = json.load(infile)
        if not structured:
            dict_out = { entry: {"name": ""} for entry in dict_in.keys() }
            dict_out = sort_OD(dict_out)
        else:
            dict_out = { "HEROES": { entry: {"name": ""} for entry in dict_in.keys() } }
            dict_out = sort_OD(dict_out)

    return dict_out


def _process_passives(data_dir, structured, verbose):
    """
        Process passives file, sorted
        Return order is:
            Passive A, B, C
    """
    if verbose: print('Processing ' + C_FILE + data_dir+'passives.json' + C_ENDC + '...')
    with open(data_dir+'passives.json') as infile:
        dict_in = json.load(infile)

    dict_out = {
        "PASSIVE_"+passives_type.upper(): {
            entry: {
                f: "" for f in ('effect', 'name')
            } for entry, fields in passives.items()
        } for passives_type, passives in dict_in.items()
    }
    dict_out = sort_OD(dict_out) # Sort recursively all levels

    # concat PASSIVE_A,B,C if no structure needed
    if not structured:
        tmp_dict = OrderedDict()
        for entry in dict_out:
            tmp_dict.update(dict_out[entry])
        dict_out = tmp_dict

    return dict_out




if __name__ == '__main__':
    args = cli()
    # do some stuff
    if args.verbose:
        print('ARGS: ' + str(args))
    if args.update:
        pass

    main(structured=args.structured, update=args.update, verbose=args.verbose)
